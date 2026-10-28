import { z } from "zod";
import { env } from "@/config/env";
import type { Repositories } from "../repositories";
import { RepositoryError } from "../repositories/types";
import { MockMediaRepository } from "../mock/MockMediaRepository";
import { roadDistanceKm } from "@/utils/geo";
import { call, http, setAuthToken, setAuthTokens, setTokenRefresher } from "../http/client";
import * as Dto from "./dto";
import * as map from "./mappers";
import { PollingRealtime, type RealtimeChannel } from "./realtime";

/**
 * Repositórios sobre a API AngoLeva (docs/api.md). Cada resposta é validada
 * contra o formato da API (`dto.ts`) e convertida para o domínio (`mappers.ts`);
 * cada corpo enviado é convertido do domínio para o formato da API.
 *
 * É a mesma implementação com o backend real e com a API simulada: só mudam
 * o transporte HTTP (adaptador do axios) e o canal de tempo real.
 */

export type ApiRepositoriesOptions = {
  /** Canal de tempo real; por omissão, polling sobre a API REST. */
  realtime?: RealtimeChannel;
  pollIntervalMs?: number;
};

/** Valida uma resposta; um formato inesperado é um erro do servidor, não dados errados no ecrã. */
export function parse<S extends z.ZodTypeAny>(schema: S, payload: unknown, what: string): z.infer<S> {
  const result = schema.safeParse(payload);
  if (result.success) return result.data;
  if (process.env.NODE_ENV !== "test") console.warn(`Resposta da API fora do contrato (${what}):`, result.error.issues.slice(0, 5));
  throw new RepositoryError("server", "Resposta inesperada do servidor.");
}

/** `{ data: T }` → T já validado. */
async function one<S extends z.ZodTypeAny>(schema: S, request: Promise<{ data: unknown }>, what: string): Promise<z.infer<S>> {
  return parse(Dto.envelope(schema), await call(request), what).data;
}

/** `{ data: T[], meta }` → T[] já validados. */
async function many<S extends z.ZodTypeAny>(schema: S, request: Promise<{ data: unknown }>, what: string): Promise<z.infer<S>[]> {
  return parse(Dto.listEnvelope(schema), await call(request), what).data;
}

/** Respostas 204 (sem corpo). */
async function none(request: Promise<{ data: unknown }>): Promise<void> {
  await call(request);
}

const bearer = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });

export function createApiRepositories({ realtime, pollIntervalMs = env.pollIntervalMs }: ApiRepositoriesOptions = {}): Repositories {
  const channel = realtime ?? new PollingRealtime(pollIntervalMs);

  const startSession = async (request: Promise<{ data: unknown }>) => {
    const session = map.toSession(await one(Dto.SessionDto, request, "sessão"));
    setAuthTokens(session);
    return session;
  };
  const refresh = (refreshToken: string) => startSession(http.post("/auth/refresh", { refresh_token: refreshToken }));
  // Um 401 com token tenta primeiro renovar a sessão (src/data/http/client.ts).
  setTokenRefresher(refresh);

  return {
    auth: {
      login: (email, password, role) => startSession(http.post("/auth/login", { email, password, role })),
      register: (input) => none(http.post("/auth/register", { full_name: input.name, email: input.email, phone: input.phone, password: input.password })),
      requestRecovery: (email) => none(http.post("/auth/recover", { email })),
      verifyCode: (email, code, purpose) => startSession(http.post("/auth/verify", { email, code, purpose })),
      resendCode: (email) => none(http.post("/auth/resend", { email })),
      restore: async (token) => {
        const me = await one(Dto.MeDto, http.get("/auth/me", bearer(token)), "sessão");
        setAuthToken(token);
        return { token, user: map.toClient(me.user), providerId: me.provider_id ?? undefined };
      },
      refresh,
      updateProfile: async (clientId, data) =>
        map.toClient(await one(Dto.ClientDto, http.patch(`/clients/${clientId}`, { full_name: data.name, email: data.email, phone: data.phone }), "cliente")),
      changePassword: (current, next) => none(http.post("/auth/password", { current_password: current, new_password: next })),
      logout: (token) => none(http.post("/auth/logout", null, bearer(token))).finally(() => setAuthToken(null)),
    },

    requests: {
      list: async (query) =>
        (await many(Dto.ServiceRequestDto, http.get("/requests", { params: { client_id: query?.clientId, provider_id: query?.providerId, status: query?.status?.join(",") } }), "pedidos")).map(
          map.toServiceRequest,
        ),
      get: async (id) => map.toServiceRequest(await one(Dto.ServiceRequestDto, http.get(`/requests/${id}`), "pedido")),
      nearby: async (providerId) => (await many(Dto.NearbyRequestDto, http.get(`/providers/${providerId}/nearby-requests`), "pedidos próximos")).map(map.toNearbyRequest),
      create: async (input) => map.toServiceRequest(await one(Dto.ServiceRequestDto, http.post("/requests", map.fromCreateRequest(input)), "pedido")),
      transition: async (id, to, actor) => map.toServiceRequest(await one(Dto.ServiceRequestDto, http.post(`/requests/${id}/transitions`, { to, actor }), "pedido")),
      accept: async (id, providerId) => map.toServiceRequest(await one(Dto.ServiceRequestDto, http.post(`/requests/${id}/accept`, { provider_id: providerId }), "pedido")),
      cancel: async (id, reason) => map.toServiceRequest(await one(Dto.ServiceRequestDto, http.post(`/requests/${id}/cancel`, { reason }), "pedido")),
      submitProposal: async (id, providerId, amount, reason) =>
        map.toServiceRequest(await one(Dto.ServiceRequestDto, http.post(`/requests/${id}/proposal`, { provider_id: providerId, amount_kz: amount, reason }), "pedido")),
      answerProposal: async (id, accepted) => map.toServiceRequest(await one(Dto.ServiceRequestDto, http.post(`/requests/${id}/proposal/answer`, { accepted }), "pedido")),
      addPickupPhotos: async (id, photos) =>
        map.toServiceRequest(await one(Dto.ServiceRequestDto, http.post(`/requests/${id}/pickup-photos`, { photos: photos.map(map.fromPhoto) }), "pedido")),
      submitProof: async (id, proof) => map.toServiceRequest(await one(Dto.ServiceRequestDto, http.post(`/requests/${id}/proof`, map.fromProofInput(proof)), "pedido")),
      pay: async (id, method) => map.toServiceRequest(await one(Dto.ServiceRequestDto, http.post(`/requests/${id}/payment`, { payment_method: method }), "pedido")),
      rate: async (id, rating, review) => map.toServiceRequest(await one(Dto.ServiceRequestDto, http.post(`/requests/${id}/rating`, { rating, review: review ?? null }), "pedido")),
      subscribe: (listener) =>
        channel.subscribe("requests", (payload) => {
          try {
            listener(map.toServiceRequest(parse(Dto.ServiceRequestDto, payload, "tempo real: pedido")));
          } catch {
            // mensagem fora do contrato: ignorada (já registada em parse)
          }
        }),
    },

    providers: {
      getState: async (providerId) => map.toProviderState(await one(Dto.ProviderStateDto, http.get(`/providers/${providerId}/state`), "prestador")),
      setOnline: (providerId, online) => none(http.put(`/providers/${providerId}/availability`, { online })),
      updateVehicle: async (providerId, values) => map.toVehicle(await one(Dto.VehicleDto, http.patch(`/providers/${providerId}/vehicle`, map.fromVehiclePatch(values)), "viatura")),
      listZones: async () => (await many(Dto.ZoneDto, http.get("/zones"), "zonas")).map(map.toZone),
      saveCoverage: async (providerId, coverage) => map.toCoverage(await one(Dto.CoverageDto, http.put(`/providers/${providerId}/coverage`, map.fromCoverage(coverage)), "cobertura")),
      submitDocument: async (providerId, documentId) => map.toDocument(await one(Dto.DocumentDto, http.post(`/providers/${providerId}/documents/${documentId}`), "documento")),
      decline: (providerId, requestId) => none(http.post(`/providers/${providerId}/declined`, { request_id: requestId })),
      withdraw: async (providerId, amount) => map.toTransaction(await one(Dto.TransactionDto, http.post(`/providers/${providerId}/withdrawals`, { amount_kz: amount }), "levantamento")),
      earnings: async (providerId) => map.toEarnings(await one(Dto.EarningsDto, http.get(`/providers/${providerId}/earnings`), "ganhos")),
      reviews: async (providerId) => (await many(Dto.ReviewDto, http.get(`/providers/${providerId}/reviews`), "avaliações")).map(map.toReview),
      subscribe: (providerId, listener) =>
        channel.subscribe(`providers/${providerId}`, (payload) => {
          try {
            listener(map.toProviderState(parse(Dto.ProviderStateDto, payload, "tempo real: prestador")));
          } catch {
            // idem
          }
        }),
    },

    locations: {
      currentLocation: async () => map.toPlace(await one(Dto.PlaceDto, http.get("/locations/current"), "localização")),
      search: async (query) => (await many(Dto.PlaceDto, http.get("/locations/search", { params: { q: query } }), "moradas")).map(map.toPlace),
      areas: async () => (await many(Dto.PlaceDto, http.get("/locations/areas"), "bairros")).map(map.toPlace),
      nearbyVehicles: async (around) =>
        (await many(Dto.NearbyVehicleDto, http.get("/vehicles/nearby", { params: map.fromCoordinates(around) }), "viaturas próximas")).map(map.toNearbyVehicle),
      // Estimativa local; o valor oficial vem no pedido devolvido pela API.
      distanceKm: roadDistanceKm,
    },

    chat: {
      messages: async (threadId, kind) => (await many(Dto.ChatMessageDto, http.get(`/threads/${threadId}/messages`, { params: { kind } }), "mensagens")).map(map.toChatMessage),
      send: async (threadId, from, text) => map.toChatMessage(await one(Dto.ChatMessageDto, http.post(`/threads/${threadId}/messages`, { sender: from, body: text }), "mensagem")),
      markRead: (threadId, reader) => none(http.post(`/threads/${threadId}/read`, { reader })),
      subscribe: (threadId, listener) =>
        channel.subscribe(`threads/${threadId}`, (payload) => {
          try {
            listener(map.toChatEvent(parse(Dto.ChatEventDto, payload, "tempo real: chat")));
          } catch {
            // idem
          }
        }),
    },

    account: {
      addresses: async (clientId) => (await many(Dto.SavedAddressDto, http.get(`/clients/${clientId}/addresses`), "moradas")).map(map.toSavedAddress),
      addAddress: async (clientId, address) =>
        map.toSavedAddress(
          await one(Dto.SavedAddressDto, http.post(`/clients/${clientId}/addresses`, { label: address.label, icon: address.icon, place: map.fromPlace(address.place) }), "morada"),
        ),
      removeAddress: (clientId, id) => none(http.delete(`/clients/${clientId}/addresses/${id}`)),
      paymentMethods: async (clientId) => (await many(Dto.PaymentMethodDto, http.get(`/clients/${clientId}/payment-methods`), "métodos de pagamento")).map(map.toPaymentMethod),
      setDefaultPayment: async (clientId, id) =>
        (await many(Dto.PaymentMethodDto, http.put(`/clients/${clientId}/payment-methods/default`, { payment_method_id: id }), "métodos de pagamento")).map(map.toPaymentMethod),
      addCard: async (clientId, last4) => map.toPaymentMethod(await one(Dto.PaymentMethodDto, http.post(`/clients/${clientId}/payment-methods`, { type: "card", last4 }), "cartão")),
    },

    support: {
      searchHelp: async (query, category) => (await many(Dto.HelpTopicDto, http.get("/help", { params: { q: query, category } }), "ajuda")).map(map.toHelpTopic),
      emergencyContacts: async () => (await many(Dto.EmergencyContactDto, http.get("/help/emergency-contacts"), "contactos")).map(map.toEmergencyContact),
      createTicket: async (input) => (await one(Dto.TicketDto, http.post("/tickets", map.fromTicketInput(input)), "ocorrência")).code,
      sendSosAlert: (input) => none(http.post("/sos", { request_id: input.requestId ?? null, ...map.fromCoordinates(input.coords) })),
    },

    // A câmara é do dispositivo, não da API: até integrar expo-image-picker e o
    // envio para /uploads, as fotos continuam a ser as de exemplo.
    media: new MockMediaRepository(),
  };
}
