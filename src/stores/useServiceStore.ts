import { create } from "zustand";
import type {
  DeliveryProofData,
  PaymentMethodKind,
  Photo,
  Role,
  ServiceKind,
  ServiceRequest,
  ServiceStatus,
} from "@/types/domain";
import { seedRequests } from "@/mocks/requests";
import { currentProvider } from "@/mocks/people";
import { buildRequest } from "@/features/booking/factory";
import { canTransition, transitionActor } from "@/features/service/stateMachine";
import { estimatePrice, providerEarningFor } from "@/features/booking/pricing";
import { isDraftComplete } from "@/features/booking/validation";
import type { BookingDraft } from "./useBookingStore";
import { useProviderStore } from "./useProviderStore";

type Actor = Role | "system";

type ServiceState = {
  requests: ServiceRequest[];
  activeClientRequestId: string | null;
  activeProviderRequestId: string | null;
  declined: string[];
  createFromDraft: (draft: BookingDraft, clientId: string) => string | null;
  transition: (id: string, to: ServiceStatus, actor: Actor) => boolean;
  /** Prestador aceita um pedido novo (fica atribuído a ele). */
  accept: (id: string, providerId?: string) => boolean;
  decline: (id: string) => void;
  cancel: (id: string, reason: string) => boolean;
  submitProposal: (id: string, amount: number, reason: string, providerId?: string) => boolean;
  answerProposal: (id: string, accepted: boolean) => void;
  addPickupPhotos: (id: string, photos: Photo[]) => void;
  submitProof: (id: string, proof: Omit<DeliveryProofData, "at">) => boolean;
  pay: (id: string, method: PaymentMethodKind) => boolean;
  rate: (id: string, rating: number, review?: string) => boolean;
  setActiveClient: (id: string | null) => void;
  reset: () => void;
};

/** Prestador simulado atribuído a cada tipo de serviço quando a simulação automática decide. */
export const simulatedProviderFor = (kind: ServiceKind) =>
  kind === "tow" ? "prv-paulo" : kind === "house_move" ? "prv-teresa" : currentProvider.id;

const now = () => new Date().toISOString();

/**
 * Estado partilhado dos pedidos. Cliente e prestador alteram os mesmos objectos,
 * por isso uma acção do prestador (aceitar, chegar, entregar) reflecte-se no
 * acompanhamento do cliente no mesmo runtime — como acontecerá com a API.
 */
export const useServiceStore = create<ServiceState>((set, get) => {
  const patch = (id: string, fn: (r: ServiceRequest) => ServiceRequest) =>
    set((s) => ({ requests: s.requests.map((r) => (r.id === id ? fn(r) : r)) }));
  const find = (id: string) => get().requests.find((r) => r.id === id);

  return {
    requests: seedRequests(),
    activeClientRequestId: null,
    activeProviderRequestId: null,
    declined: [],

    createFromDraft: (draft, clientId) => {
      if (!isDraftComplete(draft) || !draft.origin || !draft.destination) return null;
      const moving = draft.kind === "small_move" || draft.kind === "house_move" ? (draft.moving as ServiceRequest["moving"]) : undefined;
      const request = buildRequest({
        kind: draft.kind,
        origin: draft.origin,
        destination: draft.destination,
        stops: draft.stops,
        clientId,
        tow: draft.kind === "tow" ? (draft.tow as ServiceRequest["tow"]) : undefined,
        cargo: draft.kind === "cargo" ? (draft.cargo as ServiceRequest["cargo"]) : undefined,
        moving,
        scheduledFor: moving?.when === "scheduled" ? moving.date : undefined,
        photos: draft.photos,
        instructions: draft.instructions.trim() || undefined,
      });
      set((s) => ({ requests: [request, ...s.requests], activeClientRequestId: request.id }));
      return request.id;
    },

    transition: (id, to, actor) => {
      const request = find(id);
      if (!request || !canTransition(request.status, to)) return false;
      const expected = transitionActor[to];
      if (actor !== "system" && expected && expected !== actor) return false;
      patch(id, (r) => ({
        ...r,
        status: to,
        providerId: to === "assigned" ? (r.providerId ?? simulatedProviderFor(r.kind)) : r.providerId,
        timeline: [...r.timeline, { status: to, at: now() }],
      }));
      return true;
    },

    accept: (id, providerId = currentProvider.id) => {
      const request = find(id);
      if (!request || request.status !== "searching") return false;
      if (!useProviderStore.getState().online) return false;
      patch(id, (r) => ({ ...r, providerId, status: "assigned", timeline: [...r.timeline, { status: "assigned", at: now() }] }));
      set({ activeProviderRequestId: id });
      return true;
    },

    decline: (id) => set((s) => ({ declined: [...new Set([...s.declined, id])] })),

    cancel: (id, reason) => {
      const request = find(id);
      if (!request || !canTransition(request.status, "cancelled")) return false;
      patch(id, (r) => ({ ...r, status: "cancelled", cancelReason: reason, timeline: [...r.timeline, { status: "cancelled", at: now() }] }));
      set((s) => ({
        activeClientRequestId: s.activeClientRequestId === id ? null : s.activeClientRequestId,
        activeProviderRequestId: s.activeProviderRequestId === id ? null : s.activeProviderRequestId,
      }));
      return true;
    },

    submitProposal: (id, amount, reason, providerId = currentProvider.id) => {
      const request = find(id);
      if (!request || request.status !== "searching") return false;
      patch(id, (r) => ({ ...r, providerId, proposal: { amount, reason, status: "sent" } }));
      set({ activeProviderRequestId: id });
      return true;
    },

    answerProposal: (id, accepted) => {
      const request = find(id);
      if (!request?.proposal || request.proposal.status !== "sent") return;
      if (!accepted) {
        patch(id, (r) => ({ ...r, providerId: undefined, proposal: { ...r.proposal!, status: "declined" } }));
        set((s) => ({ activeProviderRequestId: s.activeProviderRequestId === id ? null : s.activeProviderRequestId }));
        return;
      }
      patch(id, (r) => {
        const fee = r.price.platformFee;
        const price = { ...r.price, total: r.proposal!.amount + fee, extras: r.proposal!.amount - r.price.base - r.price.distance };
        return {
          ...r,
          price,
          providerEarning: providerEarningFor(price),
          proposal: { ...r.proposal!, status: "accepted" },
          status: "assigned",
          timeline: [...r.timeline, { status: "assigned", at: now() }],
        };
      });
    },

    addPickupPhotos: (id, photos) => patch(id, (r) => ({ ...r, pickupPhotos: photos })),

    submitProof: (id, proof) => {
      const request = find(id);
      if (!request || request.status !== "in_transit") return false;
      patch(id, (r) => ({ ...r, proof: { ...proof, at: now() }, status: "delivered", timeline: [...r.timeline, { status: "delivered", at: now() }] }));
      if (request.providerId === currentProvider.id) useProviderStore.getState().addEarning(request);
      return true;
    },

    pay: (id, method) => {
      const request = find(id);
      if (!request || request.status !== "delivered") return false;
      patch(id, (r) => ({ ...r, paymentMethod: method, status: "paid", timeline: [...r.timeline, { status: "paid", at: now() }] }));
      return true;
    },

    rate: (id, rating, review) => {
      const request = find(id);
      if (!request || request.status !== "paid" || rating < 1 || rating > 5) return false;
      patch(id, (r) => ({ ...r, rating, review, status: "rated", timeline: [...r.timeline, { status: "rated", at: now() }] }));
      set((s) => ({ activeClientRequestId: s.activeClientRequestId === id ? null : s.activeClientRequestId }));
      return true;
    },

    setActiveClient: (id) => set({ activeClientRequestId: id }),

    reset: () => set({ requests: seedRequests(), activeClientRequestId: null, activeProviderRequestId: null, declined: [] }),
  };
});

export const useRequest = (id?: string | null) =>
  useServiceStore((s) => (id ? s.requests.find((r) => r.id === id) : undefined));

/** Recalcula a estimativa de um rascunho (usado no ecrã de estimativa antes de criar o pedido). */
export { estimatePrice };
