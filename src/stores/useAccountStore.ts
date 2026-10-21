import { create } from "zustand";
import type { PaymentMethod, SavedAddress } from "@/types/domain";
import { configureMock, dataSource, repositories } from "@/data";

export type Preferences = {
  notifications: { serviceUpdates: boolean; promotions: boolean; sound: boolean };
  locationSharing: boolean;
  language: "pt-PT" | "en";
  accessibility: { largerText: boolean; reduceMotion: boolean; highContrast: boolean };
  privacy: { shareTripStatus: boolean; analytics: boolean };
  /** Simulação: estados do serviço avançam sozinhos no lado do cliente. */
  autoAdvance: boolean;
  /** Simulação: os repositórios mock falham como se não houvesse rede. */
  simulateNetworkErrors: boolean;
};

type AccountState = {
  clientId: string | null;
  addresses: SavedAddress[];
  paymentMethods: PaymentMethod[];
  /** Preferências do dispositivo (locais, não vão para o servidor). */
  preferences: Preferences;
  /** Notificações já vistas (ids gerados em features/notifications). */
  readNotifications: string[];
  hydrate: (clientId: string) => Promise<void>;
  addAddress: (address: Omit<SavedAddress, "id">) => Promise<boolean>;
  removeAddress: (id: string) => Promise<boolean>;
  setDefaultPayment: (id: string) => Promise<boolean>;
  addCard: (last4: string) => Promise<boolean>;
  setPreferences: (fn: (p: Preferences) => Preferences) => void;
  markNotificationsRead: (ids: string[]) => void;
};

/** Endereços e métodos de pagamento (AccountRepository) e preferências locais. */
export const useAccountStore = create<AccountState>((set, get) => {
  const repo = () => repositories().account;
  const id = () => get().clientId ?? "";
  const reload = async () => {
    const [addresses, paymentMethods] = await Promise.all([repo().addresses(id()), repo().paymentMethods(id())]);
    set({ addresses, paymentMethods });
  };
  const run = async (action: () => Promise<unknown>) => {
    try {
      await action();
      await reload();
      return true;
    } catch {
      return false;
    }
  };
  return {
    clientId: null,
    addresses: [],
    paymentMethods: [],
    preferences: {
      notifications: { serviceUpdates: true, promotions: false, sound: true },
      locationSharing: true,
      language: "pt-PT",
      accessibility: { largerText: false, reduceMotion: false, highContrast: false },
      privacy: { shareTripStatus: true, analytics: false },
      autoAdvance: true,
      simulateNetworkErrors: false,
    },
    readNotifications: [],
    hydrate: async (clientId) => {
      set({ clientId });
      await reload().catch(() => undefined);
    },
    addAddress: (address) => run(() => repo().addAddress(id(), address)),
    removeAddress: (addressId) => run(() => repo().removeAddress(id(), addressId)),
    setDefaultPayment: (methodId) => run(() => repo().setDefaultPayment(id(), methodId)),
    addCard: (last4) => run(() => repo().addCard(id(), last4)),
    setPreferences: (fn) => {
      const preferences = fn(get().preferences);
      if (dataSource === "mock") configureMock({ failNetwork: preferences.simulateNetworkErrors });
      set({ preferences });
    },
    markNotificationsRead: (ids) => set((s) => ({ readNotifications: [...new Set([...s.readNotifications, ...ids])] })),
  };
});
