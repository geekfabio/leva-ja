import type { ChatMessage, Coordinates, HelpTopic, PaymentMethod, Photo, Place, ServiceRequest, ServiceStatus, Transaction, Vehicle, Zone } from "@/types/domain";
import type { Repositories } from "../repositories";
import type { Session } from "../repositories/AuthRepository";
import type { ChatEvent } from "../repositories/ChatRepository";
import type { ProviderState } from "../repositories/ProviderRepository";
import { roadDistanceKm } from "@/utils/geo";
import { call, http, setAuthToken } from "./client";

/**
 * Implementação REST dos repositórios. Os endpoints seguem a convenção proposta
 * para a API; ajustar quando o contrato do backend estiver fechado. O tempo
 * real (`subscribe`) usa polling até existir WebSocket.
 */
const poll = <T>(load: () => Promise<T>, listener: (value: T) => void, ms = 5000) => {
  const timer = setInterval(() => load().then(listener).catch(() => undefined), ms);
  return () => clearInterval(timer);
};

/** Guarda o token no cliente HTTP para os pedidos seguintes. */
const authenticated = async (request: Promise<Session>) => {
  const session = await request;
  setAuthToken(session.token);
  return session;
};

export function createHttpRepositories(): Repositories {
  return {
    auth: {
      login: (email, password, role) => authenticated(call(http.post("/auth/login", { email, password, role }))),
      register: (input) => call(http.post("/auth/register", input)),
      requestRecovery: (email) => call(http.post("/auth/recover", { email })),
      verifyCode: (email, code, purpose) => authenticated(call(http.post("/auth/verify", { email, code, purpose }))),
      resendCode: (email) => call(http.post("/auth/resend", { email })),
      restore: (token) =>
        authenticated(call<Omit<Session, "token">>(http.get("/auth/me", { headers: { Authorization: `Bearer ${token}` } })).then((me) => ({ token, ...me }))),
      updateProfile: (clientId, data) => call(http.patch(`/clients/${clientId}`, data)),
      changePassword: (current, next) => call(http.post("/auth/password", { current, next })),
      logout: (token) =>
        call<void>(http.post("/auth/logout", null, { headers: { Authorization: `Bearer ${token}` } })).finally(() => setAuthToken(null)),
    },
    requests: {
      list: (query) => call(http.get<ServiceRequest[]>("/requests", { params: query })),
      get: (id) => call(http.get<ServiceRequest>(`/requests/${id}`)),
      nearby: (providerId) => call(http.get(`/providers/${providerId}/nearby-requests`)),
      create: (input) => call(http.post<ServiceRequest>("/requests", input)),
      transition: (id, to: ServiceStatus, actor) => call(http.post<ServiceRequest>(`/requests/${id}/transitions`, { to, actor })),
      accept: (id, providerId) => call(http.post<ServiceRequest>(`/requests/${id}/accept`, { providerId })),
      cancel: (id, reason) => call(http.post<ServiceRequest>(`/requests/${id}/cancel`, { reason })),
      submitProposal: (id, providerId, amount, reason) => call(http.post<ServiceRequest>(`/requests/${id}/proposal`, { providerId, amount, reason })),
      answerProposal: (id, accepted) => call(http.post<ServiceRequest>(`/requests/${id}/proposal/answer`, { accepted })),
      addPickupPhotos: (id, photos: Photo[]) => call(http.post<ServiceRequest>(`/requests/${id}/pickup-photos`, { photos })),
      submitProof: (id, proof) => call(http.post<ServiceRequest>(`/requests/${id}/proof`, proof)),
      pay: (id, method) => call(http.post<ServiceRequest>(`/requests/${id}/payment`, { method })),
      rate: (id, rating, review) => call(http.post<ServiceRequest>(`/requests/${id}/rating`, { rating, review })),
      subscribe: (listener) => poll(() => call(http.get<ServiceRequest[]>("/requests/changes")), (list) => list.forEach(listener)),
    },
    providers: {
      getState: (providerId) => call(http.get<ProviderState>(`/providers/${providerId}/state`)),
      setOnline: (providerId, online) => call(http.put(`/providers/${providerId}/availability`, { online })),
      updateVehicle: (providerId, values) => call(http.patch<Vehicle>(`/providers/${providerId}/vehicle`, values)),
      listZones: () => call(http.get<Zone[]>("/zones")),
      saveCoverage: (providerId, coverage) => call(http.put(`/providers/${providerId}/coverage`, coverage)),
      submitDocument: (providerId, documentId) => call(http.post(`/providers/${providerId}/documents/${documentId}`)),
      decline: (providerId, requestId) => call(http.post(`/providers/${providerId}/declined`, { requestId })),
      withdraw: (providerId, amount) => call(http.post<Transaction>(`/providers/${providerId}/withdrawals`, { amount })),
      earnings: (providerId) => call(http.get(`/providers/${providerId}/earnings`)),
      reviews: (providerId) => call(http.get(`/providers/${providerId}/reviews`)),
      subscribe: (providerId, listener) => poll(() => call(http.get<ProviderState>(`/providers/${providerId}/state`)), listener),
    },
    locations: {
      currentLocation: () => call(http.get<Place>("/locations/current")),
      search: (query) => call(http.get<Place[]>("/locations/search", { params: { q: query } })),
      areas: () => call(http.get<Place[]>("/locations/areas")),
      nearbyVehicles: (around: Coordinates) => call(http.get("/vehicles/nearby", { params: around })),
      // Estimativa local; o valor oficial vem da API de rotas.
      distanceKm: roadDistanceKm,
    },
    chat: {
      messages: (threadId) => call(http.get<ChatMessage[]>(`/threads/${threadId}/messages`)),
      send: (threadId, from, text) => call(http.post<ChatMessage>(`/threads/${threadId}/messages`, { from, text })),
      markRead: (threadId, reader) => call(http.post(`/threads/${threadId}/read`, { reader })),
      subscribe: (threadId, listener: (event: ChatEvent) => void) =>
        poll(() => call(http.get<ChatMessage[]>(`/threads/${threadId}/messages`, { params: { unread: true } })), (list) => list.forEach((message) => listener({ type: "message", message }))),
    },
    account: {
      addresses: (clientId) => call(http.get(`/clients/${clientId}/addresses`)),
      addAddress: (clientId, address) => call(http.post(`/clients/${clientId}/addresses`, address)),
      removeAddress: (clientId, id) => call(http.delete(`/clients/${clientId}/addresses/${id}`)),
      paymentMethods: (clientId) => call(http.get<PaymentMethod[]>(`/clients/${clientId}/payment-methods`)),
      setDefaultPayment: (clientId, id) => call(http.put<PaymentMethod[]>(`/clients/${clientId}/payment-methods/default`, { id })),
      addCard: (clientId, last4) => call(http.post<PaymentMethod>(`/clients/${clientId}/payment-methods`, { last4 })),
    },
    support: {
      searchHelp: (query, category?: HelpTopic["category"]) => call(http.get<HelpTopic[]>("/help", { params: { q: query, category } })),
      emergencyContacts: () => call(http.get("/help/emergency-contacts")),
      createTicket: (input) => call(http.post<{ code: string }>("/tickets", input)).then((r) => r.code),
      sendSosAlert: (input) => call(http.post("/sos", input)),
    },
    media: {
      // Na fase com backend: abrir a câmara (expo-image-picker) e enviar para /uploads.
      capture: () => Promise.reject(new Error("Câmara ainda não integrada.")),
      pickupSet: () => Promise.resolve([]),
    },
  };
}

