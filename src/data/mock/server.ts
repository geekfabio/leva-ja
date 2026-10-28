import { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { z } from "zod";
import type { ServiceRequest, ServiceStatus } from "@/types/domain";
import * as Dto from "../api/dto";
import * as map from "../api/mappers";
import type { RealtimeChannel } from "../api/realtime";
import { RepositoryError, type RepositoryErrorCode, type Unsubscribe } from "../repositories/types";
import type { Session } from "../repositories/AuthRepository";
import { db, type MockDatabase, type SessionRecord } from "./database";
import { createMockRepositories } from "./index";

/**
 * API simulada: o "backend" da fase mock. Responde aos endpoints de
 * docs/api.md exactamente no formato da API (envelopes `{ data }`, snake_case,
 * erros `{ error }`, cursores), com autenticação por token. Por dentro usa os
 * serviços mock (`Mock*Repository`), que guardam as regras de negócio.
 *
 * - `adapter`: liga-se ao axios; a app usa a mesma camada HTTP que com a API real.
 * - `socket`: canal de tempo real em processo, como o futuro WebSocket.
 */

type Body = Record<string, unknown>;
type Context = { params: Record<string, string>; query: Record<string, unknown>; body: Body; token: string; session: SessionRecord };
type Handler = (ctx: Context) => unknown;
type RouteOptions = { public?: boolean; created?: boolean };
type Route = { method: string; pattern: RegExp; keys: string[]; handler: Handler; options: RouteOptions };

/** Resposta já no formato da API. */
const ok = (data: unknown) => ({ data });
const list = <T>(items: T[]) => ({ data: items, meta: { count: items.length } });

const statusFor: Record<Exclude<RepositoryErrorCode, "network">, number> = {
  not_found: 404,
  invalid_transition: 409,
  forbidden: 403,
  validation: 422,
  unauthorized: 401,
  server: 500,
};

/** Valida o corpo como faria o backend: dados fora do contrato dão 422. */
function input<S extends z.ZodTypeAny>(schema: S, body: unknown): z.infer<S> {
  const result = schema.safeParse(body);
  if (result.success) return result.data;
  const issue = result.error.issues[0];
  throw new RepositoryError("validation", `Dados inválidos${issue ? ` em ${issue.path.join(".") || "corpo"}` : ""}.`);
}

const deny = (message = "Não tens acesso a este recurso."): never => {
  throw new RepositoryError("forbidden", message);
};

/** Quem pode ver um pedido: o cliente, o prestador atribuído e, enquanto procura prestador, qualquer prestador. */
const canSee = (s: SessionRecord, r: Pick<ServiceRequest, "clientId" | "providerId" | "status">) =>
  r.clientId === s.user.id || (!!s.providerId && (r.providerId === s.providerId || r.status === "searching"));

/** Simula a viagem pela rede: o que sai do servidor é JSON, nunca referências partilhadas. */
const wire = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/** Registo de alterações com cursor (posição no registo), como os endpoints `…/changes`. */
class ChangeLog<T> {
  private items: T[] = [];
  push = (item: T) => {
    this.items.push(item);
  };
  page(since: unknown, visible: (item: T) => boolean = () => true) {
    const from = Number(since);
    const items = since === undefined || Number.isNaN(from) ? [] : this.items.slice(from).filter(visible);
    return { data: items, meta: { cursor: String(this.items.length) } };
  }
}

export type MockServerOptions = {
  /**
   * Na app, a simulação faz de "outros intervenientes" (o prestador que aceita,
   * o cliente que confirma a recolha): permite o actor `system` e propostas em
   * nome de prestadores simulados. Com `false`, só valem as regras de acesso
   * que o backend real aplica.
   */
  simulation?: boolean;
};

export function createMockServer(database: MockDatabase = db, { simulation = true }: MockServerOptions = {}) {
  const repos = createMockRepositories(database);
  const routes: Route[] = [];
  const add = (method: string, path: string, handler: Handler, options: RouteOptions = {}) => {
    const keys: string[] = [];
    const pattern = new RegExp(`^${path.replace(/:(\w+)/g, (_, key: string) => (keys.push(key), "([^/]+)"))}$`);
    routes.push({ method, pattern, keys, handler, options });
  };

  // —— Tempo real: os mesmos eventos alimentam o socket e os endpoints …/changes ——
  const requestChanges = new ChangeLog<ServiceRequest>();
  repos.requests.subscribe(requestChanges.push);
  const chatChanges = new Map<string, ChangeLog<unknown>>();
  const chatLog = (threadId: string) => {
    let log = chatChanges.get(threadId);
    if (!log) {
      const created = new ChangeLog<unknown>();
      repos.chat.subscribe(threadId, (event) => event.type === "message" && created.push(map.fromChatMessage(event.message)));
      chatChanges.set(threadId, created);
      log = created;
    }
    return log;
  };

  const socket: RealtimeChannel = {
    subscribe(topic, handler): Unsubscribe {
      const deliver = (payload: unknown) => handler(wire(payload));
      if (topic === "requests") return repos.requests.subscribe((r) => deliver(map.fromServiceRequest(r)));
      const [kind, id] = topic.split("/");
      if (kind === "providers" && id) return repos.providers.subscribe(id, (s) => deliver(map.fromProviderState(s)));
      if (kind === "threads" && id) {
        chatLog(id);
        return repos.chat.subscribe(id, (e) => deliver(map.fromChatEvent(e)));
      }
      throw new Error(`Tópico de tempo real desconhecido: ${topic}`);
    },
  };

  // —— Regras de acesso ——
  const request = (id: string) => database.requests.get(id) ?? (() => { throw new RepositoryError("not_found", "Pedido não encontrado."); })();
  const ownClient = (ctx: Context, clientId: string) => ctx.session.user.id === clientId || deny();
  const ownProvider = (ctx: Context, providerId: string) => ctx.session.providerId === providerId || deny();
  const assignedProvider = (ctx: Context, id: string) => (!!ctx.session.providerId && request(id).providerId === ctx.session.providerId) || deny();
  const requestClient = (ctx: Context, id: string) => request(id).clientId === ctx.session.user.id || deny();
  const thread = (ctx: Context, id: string) => id.startsWith("support-") || canSee(ctx.session, request(id)) || deny();

  /** Sessão no formato da API, com a validade real do token de acesso. */
  const sessionOut = (session: Session) => {
    const expiresAt = database.sessions.get(session.token)?.expiresAt;
    return map.fromSession(session, expiresAt === undefined ? 24 * 3600 : (expiresAt - Date.now()) / 1000);
  };

  // —— Autenticação ——
  add("post", "/auth/login", async ({ body }) => {
    const { email, password, role } = input(z.object({ email: z.string(), password: z.string(), role: z.enum(["client", "provider"]) }), body);
    return ok(sessionOut(await repos.auth.login(email, password, role)));
  }, { public: true });
  add("post", "/auth/register", async ({ body }) => {
    const data = input(Dto.RegisterBodyDto, body);
    await repos.auth.register({ name: data.full_name, email: data.email, phone: data.phone, password: data.password });
  }, { public: true });
  add("post", "/auth/recover", ({ body }) => repos.auth.requestRecovery(input(z.object({ email: z.string() }), body).email), { public: true });
  add("post", "/auth/verify", async ({ body }) => {
    const { email, code, purpose } = input(z.object({ email: z.string(), code: z.string(), purpose: z.enum(["register", "recover"]) }), body);
    return ok(sessionOut(await repos.auth.verifyCode(email, code, purpose)));
  }, { public: true });
  add("post", "/auth/resend", ({ body }) => repos.auth.resendCode(input(z.object({ email: z.string() }), body).email), { public: true });
  add("post", "/auth/refresh", async ({ body }) => ok(sessionOut(await repos.auth.refresh(input(z.object({ refresh_token: z.string() }), body).refresh_token))), {
    public: true,
  });
  add("get", "/auth/me", async ({ token }) => {
    const session = await repos.auth.restore(token);
    return ok({ user: map.fromClient(session.user), provider_id: session.providerId ?? null });
  });
  add("post", "/auth/password", ({ body }) => {
    const { current_password, new_password } = input(z.object({ current_password: z.string(), new_password: z.string().min(6) }), body);
    return repos.auth.changePassword(current_password, new_password);
  });
  add("post", "/auth/logout", ({ token }) => repos.auth.logout(token));
  add("patch", "/clients/:id", async (ctx) => {
    const { params, body } = ctx;
    ownClient(ctx, params.id!);
    const patch = input(Dto.ProfilePatchDto, body);
    return ok(map.fromClient(await repos.auth.updateProfile(params.id!, { name: patch.full_name, email: patch.email, phone: patch.phone })));
  });

  // —— Pedidos ——
  add("get", "/requests", async (ctx) => {
    const { query, session } = ctx;
    const status = typeof query.status === "string" && query.status ? (query.status.split(",") as ServiceStatus[]) : undefined;
    const clientId = query.client_id as string | undefined;
    const providerId = query.provider_id as string | undefined;
    if (clientId) ownClient(ctx, clientId);
    if (providerId) ownProvider(ctx, providerId);
    // Sem filtro, cada utilizador só vê os seus pedidos.
    const items = await repos.requests.list({ clientId: clientId ?? (providerId ? undefined : session.user.id), providerId, status });
    return list(items.map(map.fromServiceRequest));
  });
  add("get", "/requests/changes", ({ query, session }) => {
    const page = requestChanges.page(query.since, (r) => canSee(session, r));
    return { ...page, data: page.data.map((r) => map.fromServiceRequest(database.withPeople(r))) };
  });
  add("get", "/requests/:id", async ({ params, session }) => {
    const found = await repos.requests.get(params.id!);
    if (!canSee(session, found)) deny();
    return ok(map.fromServiceRequest(found));
  });
  add("post", "/requests", async (ctx) => {
    const body = input(Dto.CreateRequestBodyDto, ctx.body);
    ownClient(ctx, body.client_id);
    return ok(map.fromServiceRequest(await repos.requests.create(map.toCreateRequest(body))));
  }, { created: true });
  const requestAction = (path: string, run: (id: string, body: Body, ctx: Context) => Promise<ServiceRequest>) =>
    add("post", `/requests/:id${path}`, async (ctx) => ok(map.fromServiceRequest(await run(ctx.params.id!, ctx.body, ctx))));
  requestAction("/transitions", (id, body, ctx) => {
    const { to, actor } = input(z.object({ to: z.string(), actor: z.enum(["client", "provider", "system"]) }), body);
    if (actor === "client") requestClient(ctx, id);
    if (actor === "provider") assignedProvider(ctx, id);
    if (actor === "system" && !simulation) deny("Só o servidor pode fazer esta transição.");
    return repos.requests.transition(id, to as ServiceStatus, actor);
  });
  requestAction("/accept", (id, body, ctx) => {
    const providerId = input(z.object({ provider_id: z.string() }), body).provider_id;
    ownProvider(ctx, providerId);
    return repos.requests.accept(id, providerId);
  });
  requestAction("/cancel", (id, body, ctx) => {
    const reason = input(z.object({ reason: z.string() }), body).reason;
    const r = request(id);
    if (r.clientId !== ctx.session.user.id && !(ctx.session.providerId && r.providerId === ctx.session.providerId)) deny();
    return repos.requests.cancel(id, reason);
  });
  requestAction("/proposal", (id, body, ctx) => {
    const p = input(z.object({ provider_id: z.string(), amount_kz: z.number().positive(), reason: z.string() }), body);
    if (!simulation) ownProvider(ctx, p.provider_id);
    return repos.requests.submitProposal(id, p.provider_id, p.amount_kz, p.reason);
  });
  requestAction("/proposal/answer", (id, body, ctx) => {
    requestClient(ctx, id);
    return repos.requests.answerProposal(id, input(z.object({ accepted: z.boolean() }), body).accepted);
  });
  requestAction("/pickup-photos", (id, body, ctx) => {
    assignedProvider(ctx, id);
    return repos.requests.addPickupPhotos(id, input(z.object({ photos: z.array(Dto.PhotoDto) }), body).photos.map(map.toPhoto));
  });
  requestAction("/proof", (id, body, ctx) => {
    assignedProvider(ctx, id);
    return repos.requests.submitProof(id, map.toProofInput(input(Dto.ProofBodyDto, body)));
  });
  requestAction("/payment", (id, body, ctx) => {
    requestClient(ctx, id);
    return repos.requests.pay(id, input(z.object({ payment_method: z.enum(["bank_reference", "card", "cash"]) }), body).payment_method);
  });
  requestAction("/rating", (id, body, ctx) => {
    requestClient(ctx, id);
    const r = input(z.object({ rating: z.number().int().min(1).max(5), review: z.string().nullable() }), body);
    return repos.requests.rate(id, r.rating, r.review ?? undefined);
  });

  // —— Prestador ——
  add("get", "/providers/:id/state", async ({ params }) => ok(map.fromProviderState(await repos.providers.getState(params.id!))));
  add("get", "/providers/:id/nearby-requests", async ({ params }) => list((await repos.requests.nearby(params.id!)).map(map.fromNearbyRequest)));
  add("put", "/providers/:id/availability", ({ params, body }) => repos.providers.setOnline(params.id!, input(z.object({ online: z.boolean() }), body).online));
  add("patch", "/providers/:id/vehicle", async ({ params, body }) =>
    ok(map.fromVehicle(await repos.providers.updateVehicle(params.id!, map.toVehiclePatch(input(Dto.VehiclePatchDto, body))))),
  );
  add("put", "/providers/:id/coverage", async ({ params, body }) =>
    ok(map.fromCoverage(await repos.providers.saveCoverage(params.id!, map.toCoverage(input(Dto.CoverageDto, body))))),
  );
  add("post", "/providers/:id/documents/:documentId", async ({ params }) => ok(map.fromDocument(await repos.providers.submitDocument(params.id!, params.documentId!))));
  add("post", "/providers/:id/declined", ({ params, body }) => repos.providers.decline(params.id!, input(z.object({ request_id: z.string() }), body).request_id));
  add("post", "/providers/:id/withdrawals", async ({ params, body }) =>
    ok(map.fromTransaction(await repos.providers.withdraw(params.id!, input(z.object({ amount_kz: z.number() }), body).amount_kz))),
  );
  add("get", "/providers/:id/earnings", async ({ params }) => ok(map.fromEarnings(await repos.providers.earnings(params.id!))));
  add("get", "/providers/:id/reviews", async ({ params }) => list((await repos.providers.reviews(params.id!)).map(map.fromReview)));
  add("get", "/zones", async () => list((await repos.providers.listZones()).map(map.fromZone)));

  // —— Localização ——
  add("get", "/locations/current", async () => ok(map.fromPlace(await repos.locations.currentLocation())));
  add("get", "/locations/reverse", async ({ query }) => {
    const { lat, lng } = input(z.object({ lat: z.coerce.number().min(-90).max(90), lng: z.coerce.number().min(-180).max(180) }), query);
    return ok(map.fromPlace(await repos.locations.reverseGeocode(map.toCoordinates({ lat, lng }))));
  });
  add("get", "/locations/search", async ({ query }) => list((await repos.locations.search(String(query.q ?? ""))).map(map.fromPlace)));
  add("get", "/locations/areas", async () => list((await repos.locations.areas()).map(map.fromPlace)));
  add("get", "/vehicles/nearby", async ({ query }) => {
    const around = map.toCoordinates({ lat: Number(query.lat), lng: Number(query.lng) });
    return list((await repos.locations.nearbyVehicles(around)).map(map.fromNearbyVehicle));
  });

  // —— Chat ——
  add("get", "/threads/:id/messages", async ({ params, query }) => {
    chatLog(params.id!);
    return list((await repos.chat.messages(params.id!, query.kind === "support" ? "support" : "service")).map(map.fromChatMessage));
  });
  add("get", "/threads/:id/changes", ({ params, query }) => chatLog(params.id!).page(query.since));
  add("post", "/threads/:id/messages", async ({ params, body }) => {
    chatLog(params.id!);
    const { sender, body: text } = input(z.object({ sender: z.enum(["client", "provider", "support"]), body: z.string().min(1) }), body);
    return ok(map.fromChatMessage(await repos.chat.send(params.id!, sender, text)));
  }, { created: true });
  add("post", "/threads/:id/read", ({ params, body }) => repos.chat.markRead(params.id!, input(z.object({ reader: z.enum(["client", "provider", "support"]) }), body).reader));

  // —— Conta ——
  add("get", "/clients/:id/addresses", async ({ params }) => list((await repos.account.addresses(params.id!)).map(map.fromSavedAddress)));
  add("post", "/clients/:id/addresses", async ({ params, body }) => {
    const a = input(Dto.AddressBodyDto, body);
    return ok(map.fromSavedAddress(await repos.account.addAddress(params.id!, { label: a.label, icon: a.icon, place: map.toPlace(a.place) })));
  }, { created: true });
  add("delete", "/clients/:id/addresses/:addressId", ({ params }) => repos.account.removeAddress(params.id!, params.addressId!));
  add("get", "/clients/:id/payment-methods", async ({ params }) => list((await repos.account.paymentMethods(params.id!)).map(map.fromPaymentMethod)));
  add("put", "/clients/:id/payment-methods/default", async ({ params, body }) =>
    list((await repos.account.setDefaultPayment(params.id!, input(z.object({ payment_method_id: z.string() }), body).payment_method_id)).map(map.fromPaymentMethod)),
  );
  add("post", "/clients/:id/payment-methods", async ({ params, body }) =>
    ok(map.fromPaymentMethod(await repos.account.addCard(params.id!, input(z.object({ type: z.literal("card"), last4: z.string().regex(/^\d{4}$/) }), body).last4))),
  { created: true });

  // —— Suporte ——
  add("get", "/help", async ({ query }) => list((await repos.support.searchHelp(String(query.q ?? ""), query.category as never)).map(map.fromHelpTopic)));
  add("get", "/help/emergency-contacts", async () => list((await repos.support.emergencyContacts()).map(map.fromEmergencyContact)));
  add("post", "/tickets", async ({ body }) => ok({ code: await repos.support.createTicket(map.toTicketInput(input(Dto.TicketBodyDto, body))) }), { created: true });
  add("post", "/sos", ({ body }) => {
    const sos = input(z.object({ request_id: z.string().nullable(), lat: z.number(), lng: z.number() }), body);
    return repos.support.sendSosAlert({ requestId: sos.request_id ?? undefined, coords: map.toCoordinates(sos) });
  });

  /** Recursos com dono no caminho: /clients/<id>, /providers/<id> e /threads/<id>. */
  const guard = (ctx: Context, path: string) => {
    const [, kind, id] = path.split("/");
    if (!id) return;
    if (kind === "clients") ownClient(ctx, id);
    if (kind === "providers") ownProvider(ctx, id);
    if (kind === "threads") thread(ctx, id);
  };

  const adapter: AxiosAdapter = async (config) => {
    const method = (config.method ?? "get").toLowerCase();
    const path = (config.url ?? "").replace(/^[a-z]+:\/\/[^/]+/i, "").split("?")[0] ?? "";
    const reply = (status: number, data: unknown): AxiosResponse => ({ status, statusText: String(status), data, headers: {}, config, request: {} });
    const fail = (status: number, code: string, message: string): never => {
      throw new AxiosError(message, AxiosError.ERR_BAD_REQUEST, config, {}, reply(status, { error: { code, message } }));
    };

    for (const route of routes) {
      const match = route.method === method ? route.pattern.exec(path) : null;
      if (!match) continue;
      const params = Object.fromEntries(route.keys.map((key, i) => [key, decodeURIComponent(match[i + 1]!)]));
      const token = String(config.headers?.Authorization ?? "").replace(/^Bearer\s+/i, "");
      const session = database.sessions.get(token);
      if (!route.options.public) {
        if (!session) fail(401, "unauthorized", "A sessão expirou. Entra de novo.");
        if (session?.expiresAt !== undefined && session.expiresAt <= Date.now()) fail(401, "token_expired", "O token de acesso expirou.");
      }
      try {
        const ctx: Context = { params, query: (config.params ?? {}) as Record<string, unknown>, body: parseBody(config), token, session: session! };
        if (!route.options.public) guard(ctx, path);
        const data = await route.handler(ctx);
        return data === undefined ? reply(204, "") : reply(route.options.created ? 201 : 200, wire(data));
      } catch (error) {
        if (error instanceof RepositoryError) {
          if (error.code === "network") throw new AxiosError(error.message, AxiosError.ERR_NETWORK, config, {});
          fail(statusFor[error.code], error.code, error.message);
        }
        throw error;
      }
    }
    return fail(404, "not_found", `Endpoint inexistente: ${method.toUpperCase()} ${path}`);
  };

  return { adapter, socket, repositories: repos };
}

function parseBody(config: InternalAxiosRequestConfig): Body {
  if (!config.data) return {};
  if (typeof config.data === "string") {
    try {
      return JSON.parse(config.data) as Body;
    } catch {
      return {};
    }
  }
  return config.data as Body;
}
