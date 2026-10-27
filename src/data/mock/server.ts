import { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import type { ChatMessage, ServiceRequest } from "@/types/domain";
import type { Repositories } from "../repositories";
import { RepositoryError, type RepositoryErrorCode } from "../repositories/types";
import { db, type MockDatabase } from "./database";
import { createMockRepositories } from "./index";

/**
 * API simulada: responde aos mesmos endpoints que o backend terá (docs/api.md)
 * a partir da base mock, com autenticação por token, códigos HTTP e cursores
 * de alterações. Liga-se ao axios como adaptador, por isso tudo o resto da
 * camada HTTP (interceptores, erros, repetições) corre como com a API real.
 *
 * Usada nos testes de contrato e com EXPO_PUBLIC_API_URL=mock://local.
 */

type Body = Record<string, unknown>;
type Context = { params: Record<string, string>; query: Record<string, unknown>; body: Body; token: string; repos: Repositories };
type Handler = (ctx: Context) => unknown;
type Route = { method: string; pattern: RegExp; keys: string[]; handler: Handler; public: boolean };

const statusFor: Record<Exclude<RepositoryErrorCode, "network">, number> = {
  not_found: 404,
  invalid_transition: 409,
  forbidden: 403,
  validation: 422,
  unauthorized: 401,
  server: 500,
};

/** Registo de alterações com cursor (posição no registo), como os endpoints `…/changes`. */
class ChangeLog<T> {
  private items: T[] = [];
  push = (item: T) => {
    this.items.push(item);
  };
  page(since: unknown) {
    const from = Number(since);
    const items = since === undefined || Number.isNaN(from) ? [] : this.items.slice(from);
    return { items, cursor: String(this.items.length) };
  }
}

export function createMockServer(database: MockDatabase = db) {
  const repos = createMockRepositories(database);
  const routes: Route[] = [];
  const add = (method: string, path: string, handler: Handler, isPublic = false) => {
    const keys: string[] = [];
    const pattern = new RegExp(`^${path.replace(/:(\w+)/g, (_, key: string) => (keys.push(key), "([^/]+)"))}$`);
    routes.push({ method, pattern, keys, handler, public: isPublic });
  };

  const requestChanges = new ChangeLog<ServiceRequest>();
  repos.requests.subscribe(requestChanges.push);
  const chatChanges = new Map<string, ChangeLog<ChatMessage>>();
  const chatLog = (threadId: string) => {
    let log = chatChanges.get(threadId);
    if (!log) {
      const created = new ChangeLog<ChatMessage>();
      repos.chat.subscribe(threadId, (event) => event.type === "message" && created.push(event.message));
      chatChanges.set(threadId, created);
      log = created;
    }
    return log;
  };

  // Autenticação
  add("post", "/auth/login", ({ body }) => repos.auth.login(String(body.email), String(body.password), body.role === "provider" ? "provider" : "client"), true);
  add("post", "/auth/register", ({ body }) => repos.auth.register(body as never), true);
  add("post", "/auth/recover", ({ body }) => repos.auth.requestRecovery(String(body.email)), true);
  add("post", "/auth/verify", ({ body }) => repos.auth.verifyCode(String(body.email), String(body.code), body.purpose === "recover" ? "recover" : "register"), true);
  add("post", "/auth/resend", ({ body }) => repos.auth.resendCode(String(body.email)), true);
  add("get", "/auth/me", async ({ token }) => {
    const { token: _token, ...me } = await repos.auth.restore(token);
    return me;
  });
  add("post", "/auth/password", ({ body }) => repos.auth.changePassword(String(body.current), String(body.next)));
  add("post", "/auth/logout", ({ token }) => repos.auth.logout(token));
  add("patch", "/clients/:id", ({ params, body }) => repos.auth.updateProfile(params.id!, body));

  // Pedidos
  add("get", "/requests", ({ query }) => repos.requests.list(query as never));
  add("get", "/requests/changes", ({ query }) => requestChanges.page(query.since));
  add("get", "/requests/:id", ({ params }) => repos.requests.get(params.id!));
  add("post", "/requests", ({ body }) => repos.requests.create(body as never));
  add("post", "/requests/:id/transitions", ({ params, body }) => repos.requests.transition(params.id!, body.to as never, body.actor as never));
  add("post", "/requests/:id/accept", ({ params, body }) => repos.requests.accept(params.id!, String(body.providerId)));
  add("post", "/requests/:id/cancel", ({ params, body }) => repos.requests.cancel(params.id!, String(body.reason)));
  add("post", "/requests/:id/proposal", ({ params, body }) => repos.requests.submitProposal(params.id!, String(body.providerId), Number(body.amount), String(body.reason)));
  add("post", "/requests/:id/proposal/answer", ({ params, body }) => repos.requests.answerProposal(params.id!, body.accepted === true));
  add("post", "/requests/:id/pickup-photos", ({ params, body }) => repos.requests.addPickupPhotos(params.id!, body.photos as never));
  add("post", "/requests/:id/proof", ({ params, body }) => repos.requests.submitProof(params.id!, body as never));
  add("post", "/requests/:id/payment", ({ params, body }) => repos.requests.pay(params.id!, body.method as never));
  add("post", "/requests/:id/rating", ({ params, body }) => repos.requests.rate(params.id!, Number(body.rating), body.review as string | undefined));

  // Prestador
  add("get", "/providers/:id/state", ({ params }) => repos.providers.getState(params.id!));
  add("get", "/providers/:id/nearby-requests", ({ params }) => repos.requests.nearby(params.id!));
  add("put", "/providers/:id/availability", ({ params, body }) => repos.providers.setOnline(params.id!, body.online === true));
  add("patch", "/providers/:id/vehicle", ({ params, body }) => repos.providers.updateVehicle(params.id!, body));
  add("put", "/providers/:id/coverage", ({ params, body }) => repos.providers.saveCoverage(params.id!, body as never));
  add("post", "/providers/:id/documents/:documentId", ({ params }) => repos.providers.submitDocument(params.id!, params.documentId!));
  add("post", "/providers/:id/declined", ({ params, body }) => repos.providers.decline(params.id!, String(body.requestId)));
  add("post", "/providers/:id/withdrawals", ({ params, body }) => repos.providers.withdraw(params.id!, Number(body.amount)));
  add("get", "/providers/:id/earnings", ({ params }) => repos.providers.earnings(params.id!));
  add("get", "/providers/:id/reviews", ({ params }) => repos.providers.reviews(params.id!));
  add("get", "/zones", () => repos.providers.listZones());

  // Localização
  add("get", "/locations/current", () => repos.locations.currentLocation());
  add("get", "/locations/search", ({ query }) => repos.locations.search(String(query.q ?? "")));
  add("get", "/locations/areas", () => repos.locations.areas());
  add("get", "/vehicles/nearby", ({ query }) => repos.locations.nearbyVehicles({ latitude: Number(query.latitude), longitude: Number(query.longitude) }));

  // Chat
  add("get", "/threads/:id/messages", ({ params, query }) => {
    chatLog(params.id!);
    return repos.chat.messages(params.id!, query.kind === "support" ? "support" : "service");
  });
  add("get", "/threads/:id/changes", ({ params, query }) => chatLog(params.id!).page(query.since));
  add("post", "/threads/:id/messages", ({ params, body }) => {
    chatLog(params.id!);
    return repos.chat.send(params.id!, body.from as never, String(body.text));
  });
  add("post", "/threads/:id/read", ({ params, body }) => repos.chat.markRead(params.id!, body.reader as never));

  // Conta
  add("get", "/clients/:id/addresses", ({ params }) => repos.account.addresses(params.id!));
  add("post", "/clients/:id/addresses", ({ params, body }) => repos.account.addAddress(params.id!, body as never));
  add("delete", "/clients/:id/addresses/:addressId", ({ params }) => repos.account.removeAddress(params.id!, params.addressId!));
  add("get", "/clients/:id/payment-methods", ({ params }) => repos.account.paymentMethods(params.id!));
  add("put", "/clients/:id/payment-methods/default", ({ params, body }) => repos.account.setDefaultPayment(params.id!, String(body.id)));
  add("post", "/clients/:id/payment-methods", ({ params, body }) => repos.account.addCard(params.id!, String(body.last4)));

  // Suporte
  add("get", "/help", ({ query }) => repos.support.searchHelp(String(query.q ?? ""), query.category as never));
  add("get", "/help/emergency-contacts", () => repos.support.emergencyContacts());
  add("post", "/tickets", async ({ body }) => ({ code: await repos.support.createTicket(body as never) }));
  add("post", "/sos", ({ body }) => repos.support.sendSosAlert(body as never));

  const adapter: AxiosAdapter = async (config) => {
    const method = (config.method ?? "get").toLowerCase();
    const path = (config.url ?? "").replace(/^[a-z]+:\/\/[^/]+/i, "").split("?")[0] ?? "";
    const reply = (status: number, data: unknown): AxiosResponse => ({ status, statusText: String(status), data, headers: {}, config, request: {} });
    const fail = (status: number, message: string, code: string) => {
      throw new AxiosError(message, AxiosError.ERR_BAD_REQUEST, config, {}, reply(status, { message, code }));
    };

    for (const route of routes) {
      const match = route.method === method ? route.pattern.exec(path) : null;
      if (!match) continue;
      const params = Object.fromEntries(route.keys.map((key, i) => [key, decodeURIComponent(match[i + 1]!)]));
      const token = String(config.headers?.Authorization ?? "").replace(/^Bearer\s+/i, "");
      if (!route.public && !database.sessions.has(token)) fail(401, "A sessão expirou. Entra de novo.", "unauthorized");
      try {
        const data = await route.handler({ params, query: (config.params ?? {}) as Record<string, unknown>, body: parseBody(config), token, repos });
        return data === undefined ? reply(204, "") : reply(method === "post" && path === "/requests" ? 201 : 200, data);
      } catch (error) {
        if (error instanceof RepositoryError) {
          if (error.code === "network") throw new AxiosError(error.message, AxiosError.ERR_NETWORK, config, {});
          fail(statusFor[error.code], error.message, error.code);
        }
        throw error;
      }
    }
    return fail(404, `Endpoint inexistente: ${method.toUpperCase()} ${path}`, "not_found");
  };

  return { adapter, repositories: repos };
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
