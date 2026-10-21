import { create } from "zustand";
import type { PaymentMethod, SavedAddress } from "@/types/domain";
import { initialAddresses, initialPaymentMethods } from "@/mocks/account";

export type Preferences = {
  notifications: { serviceUpdates: boolean; promotions: boolean; sound: boolean };
  locationSharing: boolean;
  language: "pt-PT" | "en";
  accessibility: { largerText: boolean; reduceMotion: boolean; highContrast: boolean };
  privacy: { shareTripStatus: boolean; analytics: boolean };
  /** Simulação: estados do serviço avançam sozinhos no lado do cliente. */
  autoAdvance: boolean;
  /** Simulação: as consultas assíncronas falham para testar estados de erro. */
  simulateNetworkErrors: boolean;
};

type AccountState = {
  addresses: SavedAddress[];
  paymentMethods: PaymentMethod[];
  preferences: Preferences;
  addAddress: (address: Omit<SavedAddress, "id">) => void;
  removeAddress: (id: string) => void;
  setDefaultPayment: (id: string) => void;
  addCard: (last4: string) => void;
  setPreferences: (fn: (p: Preferences) => Preferences) => void;
};

export const useAccountStore = create<AccountState>((set) => ({
  addresses: initialAddresses,
  paymentMethods: initialPaymentMethods,
  preferences: {
    notifications: { serviceUpdates: true, promotions: false, sound: true },
    locationSharing: true,
    language: "pt-PT",
    accessibility: { largerText: false, reduceMotion: false, highContrast: false },
    privacy: { shareTripStatus: true, analytics: false },
    autoAdvance: true,
    simulateNetworkErrors: false,
  },
  addAddress: (address) => set((s) => ({ addresses: [...s.addresses, { ...address, id: `addr-${Date.now()}` }] })),
  removeAddress: (id) => set((s) => ({ addresses: s.addresses.filter((a) => a.id !== id) })),
  setDefaultPayment: (id) => set((s) => ({ paymentMethods: s.paymentMethods.map((p) => ({ ...p, isDefault: p.id === id })) })),
  addCard: (last4) =>
    set((s) => ({
      paymentMethods: [...s.paymentMethods, { id: `pm-card-${last4}-${Date.now()}`, kind: "card", title: "Cartão", detail: `Mastercard terminado em ${last4}`, isDefault: false }],
    })),
  setPreferences: (fn) => set((s) => ({ preferences: fn(s.preferences) })),
}));
