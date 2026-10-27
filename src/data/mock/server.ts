import { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { z } from "zod";
import type { ServiceStatus } from "@/types/domain";
import * as Dto from "../api/dto";
import * as map from "../api/mappers";
import type { RealtimeChannel } from "../api/realtime";
import { RepositoryError, type RepositoryErrorCode, type Unsubscribe } from "../repositories/types";
import { db, type MockDatabase } from "./database";
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
type Context = { params: Record<string, string>; query: Record<string, unknown>; body: Body; token: string };
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

/** Simula a viagem pela rede: o que sai do servidor é JSON, nunca referências partilhadas. */
const wire = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/** Registo de alterações com cursor (posição no registo), como os endpoints `…/changes`. */
class ChangeLog {
  private items: unknown[] = [];
  push = (item: unknown) => {
    this.items.push(item);
  };
  page(since: unknown) {
    const from = Number(since);
    const items = since === undefined || Number.isNaN(from) ? [] : this.items.slice(from);
    return { data: items, meta: { cursor: String(this.items.length) } };
  }
}

export function createMockServer(database: MockDatabase = db) {
  const repos = createMockRepositories(database);
  const routes: Route[] = [];
  const add = (method: string, path: string, handler: Handler, options: RouteOptions = {}) => {
    const keys: string[] = [];
    const pattern = new RegExp(`^${path.replace(/:(\w+)/g, (_, key: string) => (keys.push(key), "([^/]+)"))}$`);
    routes.push({ method, pattern, keys, handler, options });
  };

  // —— Tempo real: os mesmos eventos alimentam o socket e os endpoints …/changes ——
  const requestChanges = new ChangeLog();
  repos.requests.subscribe((r) => requestChanges.push(map.fromServiceRequest(r)));
  const chatChanges = new Map<string, ChangeLog>();
  const chatLog = (threadId: string) => {
    let log = chatChanges.get(threadId);
    if (!log) {
      const created = new ChangeLog();
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

  // —— Autenticação ——
  add("post", "/auth/login", async ({ body }) => {
    const { email, password, role } = input(z.object({ email: z.string(), password: z.string(), role: z.enum(["client", "provider"]) }), body);
    return ok(map.fromSession(await repos.auth.login(email, password, role)));
  }, { public: true });
  add("post", "/auth/register", async ({ body }) => {
    const data = input(Dto.RegisterBodyDto, body);
    await repos.auth.register({ name: data.full_name, email: data.email, phone: data.phone, password: data.password });
  }, { public: true });
  add("post", "/auth/recover", ({ body }) => repos.auth.requestRecovery(input(z.object({ email: z.string() }), body).email), { public: true });
  add("post", "/auth/verify", async ({ body }) => {
    const { email, code, purpose } = input(z.object({ email: z.string(), code: z.string(), purpose: z.enum(["register", "recover"]) }), body);
    return ok(map.fromSession(await repos.auth.verifyCode(email, code, purpose)));
  }, { public: true });
  add("post", "/auth/resend", ({ body }) => repos.auth.resendCode(input(z.object({ email: z.string() }), body).email), { public: true });
  add("get", "/auth/me", async ({ token }) => {
    const { access_token: _token, token_type: _type, ...me } = map.fromSession(await repos.auth.restore(token));
    return ok(me);
  });
  add("post", "/auth/password", ({ body }) => {
    const { current_password, new_password } = input(z.object({ current_password: z.string(), new_password: z.string().min(6) }), body);
    return repos.auth.changePassword(current_password, new_password);
  });
  add("post", "/auth/logout", ({ token }) => repos.auth.logout(token));
  add("patch", "/clients/:id", async ({ params, body }) => {
    const patch = input(Dto.ProfilePatchDto, body);
    return ok(map.fromClient(await repos.auth.updateProfile(params.id!, { name: patch.full_name, email: patch.email, phone: patch.phone })));
  });

  // —— Pedidos ——
  add("get", "/requests", async ({ query }) => {
    const status = typeof query.status === "string" && query.status ? (query.status.split(",") as ServiceStatus[]) : undefined;
    const items = await repos.requests.list({ clientId: query.client_id as string | undefined, providerId: query.provider_id as string | undefined, status });
    return list(items.map(map.fromServiceRequest));
  });
  add("get", "/requests/changes", ({ query }) => requestChanges.page(query.since));
  add("get", "/requests/:id", async ({ params }) => ok(map.fromServiceRequest(await repos.requests.get(params.id!))));
  add("post", "/requests", async ({ body }) => ok(map.fromServiceRequest(await repos.requests.create(map.toCreateRequest(input(Dto.CreateRequestBodyDto, body))))), { created: true });
  const requestAction = (path: string, run: (id: string, body: Body) => Promise<Parameters<typeof map.fromServiceRequest>[0]>) =>
    add("post", `/requests/:id${path}`, async ({ params, body }) => ok(map.fromServiceRequest(await run(params.id!, body))));
  requestAction("/transitions", (id, body) => {
    const { to, actor } = input(z.object({ to: z.string(), actor: z.enum(["client", "provider", "system"]) }), body);
    return repos.requests.transition(id, to as ServiceStatus, actor);
  });
  requestAction("/accept", (id, body) => repos.requests.accept(id, input(z.object({ provider_id: z.string() }), body).provider_id));
  requestAction("/cancel", (id, body) => repos.requests.cancel(id, input(z.object({ reason: z.string() }), body).reason));
  requestAction("/proposal", (id, body) => {
    const p = input(z.object({ provider_id: z.string(), amount_kz: z.number().positive(), reason: z.string() }), body);
    return repos.requests.submitProposal(id, p.provider_id, p.amount_kz, p.reason);
  });
  requestAction("/proposal/answer", (id, body) => repos.requests.answerProposal(id, input(z.object({ accepted: z.boolean() }), body).accepted));
  requestAction("/pickup-photos", (id, body) => repos.requests.addPickupPhotos(id, input(z.object({ photos: z.array(Dto.PhotoDto) }), body).photos.map(map.toPhoto)));
  requestAction("/proof", (id, body) => repos.requests.submitProof(id, map.toProofInput(input(Dto.ProofBodyDto, body))));
  requestAction("/payment", (id, body) => repos.requests.pay(id, input(z.object({ payment_method: z.enum(["bank_reference", "card", "cash"]) }), body).payment_method));
  requestAction("/rating", (id, body) => {
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
      if (!route.options.public && !database.sessions.has(token)) fail(401, "unauthorized", "A sessão expirou. Entra de novo.");
      try {
        const data = await route.handler({ params, query: (config.params ?? {}) as Record<string, unknown>, body: parseBody(config), token });
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
