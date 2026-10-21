import { create } from "zustand";
import type { ProviderDocument, ServiceKind, ServiceRequest, Transaction, Vehicle } from "@/types/domain";
import { currentProvider } from "@/mocks/people";
import { initialBalance, initialTransactions } from "@/mocks/finance";
import { initialDocuments, initialServices, initialZones } from "@/mocks/provider";
import { serviceTitle } from "@/features/booking/catalog";

type ProviderState = {
  online: boolean;
  vehicle: Vehicle;
  zones: string[];
  services: ServiceKind[];
  documents: ProviderDocument[];
  balance: number;
  transactions: Transaction[];
  setOnline: (online: boolean) => void;
  updateVehicle: (values: Partial<Vehicle>) => void;
  saveCoverage: (zones: string[], services: ServiceKind[]) => void;
  /** Envia um documento novo: fica "em análise" e é validado pela simulação. */
  submitDocument: (id: string) => void;
  addEarning: (request: ServiceRequest) => void;
  /** Cria um levantamento pendente que conclui sozinho (transferência simulada). */
  withdraw: (amount: number) => string;
  reset: () => void;
};

const initial = () => ({
  online: true,
  vehicle: currentProvider.vehicle,
  zones: [...initialZones],
  services: [...initialServices],
  documents: initialDocuments.map((d) => ({ ...d })),
  balance: initialBalance,
  transactions: initialTransactions.map((t) => ({ ...t })),
});

export const useProviderStore = create<ProviderState>((set, get) => ({
  ...initial(),
  setOnline: (online) => set({ online }),
  updateVehicle: (values) => set((s) => ({ vehicle: { ...s.vehicle, ...values } })),
  saveCoverage: (zones, services) => set({ zones, services }),
  submitDocument: (id) => {
    set((s) => ({ documents: s.documents.map((d) => (d.id === id ? { ...d, state: "pending" } : d)) }));
    setTimeout(() => {
      const next = new Date();
      next.setFullYear(next.getFullYear() + 2);
      set((s) => ({
        documents: s.documents.map((d) => (d.id === id ? { ...d, state: "verified", validUntil: next.toISOString() } : d)),
      }));
    }, 4000);
  },
  addEarning: (request) => {
    if (get().transactions.some((t) => t.id === `tx-${request.id}`)) return;
    const tx: Transaction = {
      id: `tx-${request.id}`,
      kind: "earning",
      title: serviceTitle[request.kind],
      amount: request.providerEarning,
      at: new Date().toISOString(),
      status: "completed",
      serviceKind: request.kind,
    };
    set((s) => ({ transactions: [tx, ...s.transactions], balance: s.balance + tx.amount }));
  },
  withdraw: (amount) => {
    const id = `tx-wd-${Date.now()}`;
    const tx: Transaction = { id, kind: "withdrawal", title: "Levantamento para conta bancária", amount: -amount, at: new Date().toISOString(), status: "pending" };
    set((s) => ({ transactions: [tx, ...s.transactions], balance: s.balance - amount }));
    setTimeout(() => {
      set((s) => ({ transactions: s.transactions.map((t) => (t.id === id ? { ...t, status: "completed" } : t)) }));
    }, 3000);
    return id;
  },
  reset: () => set(initial()),
}));
