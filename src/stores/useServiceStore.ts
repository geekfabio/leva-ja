import { useEffect } from "react";
import { create } from "zustand";
import type { DeliveryProofData, Payment, PaymentMethodKind, Photo, ServiceRequest, ServiceStatus } from "@/types/domain";
import { repositories, type RequestActor } from "@/data";
import { isDraftComplete } from "@/features/booking/validation";
import { estimatePrice } from "@/features/booking/pricing";
import type { BookingDraft } from "./useBookingStore";
import { useSessionStore } from "./useSessionStore";

type ServiceState = {
  /** Cache local dos pedidos conhecidos, mantida em dia pelas subscrições do repositório. */
  requests: ServiceRequest[];
  loaded: boolean;
  /** Mensagem do último erro de uma acção (para o ecrã mostrar). */
  lastError: string | null;
  activeClientRequestId: string | null;
  activeProviderRequestId: string | null;
  hydrate: () => Promise<void>;
  upsert: (request: ServiceRequest) => void;
  createFromDraft: (draft: BookingDraft, clientId: string) => Promise<string | null>;
  transition: (id: string, to: ServiceStatus, actor: RequestActor) => Promise<boolean>;
  /** Prestador aceita um pedido novo (fica atribuído a ele). */
  accept: (id: string, providerId?: string) => Promise<boolean>;
  cancel: (id: string, reason: string) => Promise<boolean>;
  submitProposal: (id: string, amount: number, reason: string, providerId?: string) => Promise<boolean>;
  answerProposal: (id: string, accepted: boolean) => Promise<boolean>;
  addPickupPhotos: (id: string, photos: Photo[]) => Promise<boolean>;
  submitProof: (id: string, proof: Omit<DeliveryProofData, "at">) => Promise<boolean>;
  /**
   * Inicia o pagamento. Devolve-o com o estado (`confirmed` no cartão e no
   * numerário; `pending` com os dados da referência Multicaixa), ou `null` com erro.
   */
  startPayment: (id: string, method: PaymentMethodKind) => Promise<Payment | null>;
  /** Consulta um pagamento pendente; se já estiver confirmado, actualiza o pedido. */
  checkPayment: (payment: Payment) => Promise<Payment | null>;
  /** Paga e espera pela confirmação imediata (cartão ou numerário). */
  pay: (id: string, method: PaymentMethodKind) => Promise<boolean>;
  rate: (id: string, rating: number, review?: string) => Promise<boolean>;
  setActiveClient: (id: string | null) => void;
  clear: () => void;
};

const myProviderId = () => useSessionStore.getState().providerId ?? "";

/**
 * Estado partilhado dos pedidos. As regras (máquina de estados, preços, actores)
 * são aplicadas pelo RequestRepository — mock agora, API depois. Cliente e
 * prestador vêem as mesmas alterações através de `subscribe`.
 */
export const useServiceStore = create<ServiceState>((set, get) => {
  /** Executa uma acção no repositório, guarda o resultado e devolve se correu bem. */
  const run = async (action: () => Promise<ServiceRequest>, after?: (r: ServiceRequest) => void) => {
    try {
      const request = await action();
      get().upsert(request);
      after?.(request);
      set({ lastError: null });
      return true;
    } catch (error) {
      set({ lastError: error instanceof Error ? error.message : "Não foi possível concluir a acção." });
      return false;
    }
  };
  const repo = () => repositories().requests;

  return {
    requests: [],
    loaded: false,
    lastError: null,
    activeClientRequestId: null,
    activeProviderRequestId: null,

    hydrate: async () => {
      try {
        // A API devolve a cada utilizador só o que lhe diz respeito: os pedidos
        // dele como cliente e, se for prestador, os atribuídos e os próximos.
        const providerId = myProviderId();
        const [own, assigned, nearby] = await Promise.all([
          repo().list(),
          providerId ? repo().list({ providerId }) : Promise.resolve([]),
          providerId ? repo().nearby(providerId).then((list) => list.map((n) => n.request)) : Promise.resolve([]),
        ]);
        const requests = [...new Map([...nearby, ...assigned, ...own].map((r) => [r.id, r])).values()];
        set({ requests, loaded: true });
      } catch (error) {
        set({ loaded: true, lastError: error instanceof Error ? error.message : "Erro ao carregar pedidos." });
      }
    },

    upsert: (request) =>
      set((s) => {
        const exists = s.requests.some((r) => r.id === request.id);
        return { requests: exists ? s.requests.map((r) => (r.id === request.id ? request : r)) : [request, ...s.requests] };
      }),

    createFromDraft: async (draft, clientId) => {
      if (!isDraftComplete(draft) || !draft.origin || !draft.destination) return null;
      const moving = draft.kind === "small_move" || draft.kind === "house_move" ? (draft.moving as ServiceRequest["moving"]) : undefined;
      let id: string | null = null;
      await run(
        () =>
          repo().create({
            kind: draft.kind,
            origin: draft.origin!,
            destination: draft.destination!,
            stops: draft.stops,
            clientId,
            tow: draft.kind === "tow" ? (draft.tow as ServiceRequest["tow"]) : undefined,
            cargo: draft.kind === "cargo" ? (draft.cargo as ServiceRequest["cargo"]) : undefined,
            moving,
            scheduledFor: moving?.when === "scheduled" ? moving.date : undefined,
            photos: draft.photos,
            instructions: draft.instructions.trim() || undefined,
          }),
        (r) => {
          id = r.id;
          set({ activeClientRequestId: r.id });
        },
      );
      return id;
    },

    transition: (id, to, actor) => run(() => repo().transition(id, to, actor)),

    accept: (id, providerId = myProviderId()) => run(() => repo().accept(id, providerId), (r) => set({ activeProviderRequestId: r.id })),

    cancel: (id, reason) =>
      run(
        () => repo().cancel(id, reason),
        () =>
          set((s) => ({
            activeClientRequestId: s.activeClientRequestId === id ? null : s.activeClientRequestId,
            activeProviderRequestId: s.activeProviderRequestId === id ? null : s.activeProviderRequestId,
          })),
      ),

    submitProposal: (id, amount, reason, providerId = myProviderId()) => run(() => repo().submitProposal(id, providerId, amount, reason), () => set({ activeProviderRequestId: id })),

    answerProposal: (id, accepted) => run(() => repo().answerProposal(id, accepted)),

    addPickupPhotos: (id, photos) => run(() => repo().addPickupPhotos(id, photos)),

    submitProof: (id, proof) => run(() => repo().submitProof(id, proof)),

    startPayment: async (id, method) => {
      try {
        const payment = await repositories().payments.start(id, method);
        // Confirmado: o pedido já está pago no servidor; actualiza a cache sem esperar pelo tempo real.
        if (payment.status === "confirmed") await run(() => repo().get(id));
        set({ lastError: null });
        return payment;
      } catch (error) {
        set({ lastError: error instanceof Error ? error.message : "Não foi possível iniciar o pagamento." });
        return null;
      }
    },

    checkPayment: async (payment) => {
      try {
        const current = await repositories().payments.get(payment.id);
        if (current.status === "confirmed") await run(() => repo().get(payment.requestId));
        return current;
      } catch (error) {
        set({ lastError: error instanceof Error ? error.message : "Não foi possível consultar o pagamento." });
        return null;
      }
    },

    pay: async (id, method) => (await get().startPayment(id, method))?.status === "confirmed",

    rate: (id, rating, review) =>
      run(
        () => repo().rate(id, rating, review),
        () => set((s) => ({ activeClientRequestId: s.activeClientRequestId === id ? null : s.activeClientRequestId })),
      ),

    setActiveClient: (id) => set({ activeClientRequestId: id }),

    clear: () => set({ requests: [], loaded: false, activeClientRequestId: null, activeProviderRequestId: null }),
  };
});

/** Pedido da cache; se não estiver lá (ex.: ligação directa), é pedido à API. */
export function useRequest(id?: string | null) {
  const request = useServiceStore((s) => (id ? s.requests.find((r) => r.id === id) : undefined));
  const loaded = useServiceStore((s) => s.loaded);
  useEffect(() => {
    if (!id || request || !loaded) return;
    repositories()
      .requests.get(id)
      .then((found) => useServiceStore.getState().upsert(found))
      .catch(() => undefined);
  }, [id, request, loaded]);
  return request;
}

/** Recalcula a estimativa de um rascunho (usado no ecrã de estimativa antes de criar o pedido). */
export { estimatePrice };
