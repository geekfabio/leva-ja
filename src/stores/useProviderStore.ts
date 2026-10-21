import { create } from "zustand";
import type { Provider, ProviderDocument, ServiceKind, Transaction, Vehicle } from "@/types/domain";
import { repositories, type PayoutAccount, type ProviderState } from "@/data";

type ProviderStoreState = {
  providerId: string | null;
  loaded: boolean;
  profile: Provider | null;
  online: boolean;
  vehicle: Vehicle | null;
  zones: string[];
  services: ServiceKind[];
  documents: ProviderDocument[];
  balance: number;
  transactions: Transaction[];
  payout: PayoutAccount | null;
  declined: string[];
  lastError: string | null;
  /** Carrega o estado do prestador e passa a receber as alterações em tempo real. */
  hydrate: (providerId: string) => Promise<void>;
  apply: (state: ProviderState) => void;
  setOnline: (online: boolean) => Promise<boolean>;
  updateVehicle: (values: Partial<Vehicle>) => Promise<boolean>;
  saveCoverage: (zones: string[], services: ServiceKind[]) => Promise<boolean>;
  submitDocument: (id: string) => Promise<boolean>;
  decline: (requestId: string) => Promise<boolean>;
  withdraw: (amount: number) => Promise<boolean>;
};

let unsubscribe: (() => void) | undefined;

/** Cache da área do prestador sobre o ProviderRepository. */
export const useProviderStore = create<ProviderStoreState>((set, get) => {
  const repo = () => repositories().providers;
  const id = () => get().providerId ?? "";
  const run = async (action: () => Promise<unknown>) => {
    try {
      await action();
      // O estado oficial chega pela subscrição; recarrega para não depender dela.
      get().apply(await repo().getState(id()));
      set({ lastError: null });
      return true;
    } catch (error) {
      set({ lastError: error instanceof Error ? error.message : "Não foi possível concluir a acção." });
      return false;
    }
  };

  return {
    providerId: null,
    loaded: false,
    profile: null,
    online: false,
    vehicle: null,
    zones: [],
    services: [],
    documents: [],
    balance: 0,
    transactions: [],
    payout: null,
    declined: [],
    lastError: null,

    hydrate: async (providerId) => {
      set({ providerId });
      unsubscribe?.();
      unsubscribe = repo().subscribe(providerId, get().apply);
      try {
        get().apply(await repo().getState(providerId));
      } catch (error) {
        set({ loaded: true, lastError: error instanceof Error ? error.message : "Erro ao carregar o prestador." });
      }
    },

    apply: (state) =>
      set({
        loaded: true,
        profile: state.profile,
        vehicle: state.profile.vehicle,
        online: state.online,
        zones: state.coverage.zones,
        services: state.coverage.services,
        documents: state.documents,
        balance: state.wallet.balance,
        transactions: state.wallet.transactions,
        payout: state.wallet.payout,
        declined: state.declined,
      }),

    setOnline: (online) => {
      set({ online });
      return run(() => repo().setOnline(id(), online));
    },
    updateVehicle: (values) => run(() => repo().updateVehicle(id(), values)),
    saveCoverage: (zones, services) => run(() => repo().saveCoverage(id(), { zones, services })),
    submitDocument: (documentId) => run(() => repo().submitDocument(id(), documentId)),
    decline: (requestId) => {
      set((s) => ({ declined: [...s.declined, requestId] }));
      return run(() => repo().decline(id(), requestId));
    },
    withdraw: (amount) => run(() => repo().withdraw(id(), amount)),
  };
});
