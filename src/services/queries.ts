import { useQuery } from "@tanstack/react-query";
import type { Coordinates, HelpTopic } from "@/types/domain";
import { repositories } from "@/data";
import { useAccountStore } from "@/stores/useAccountStore";
import { useSessionStore } from "@/stores/useSessionStore";

/**
 * Consultas TanStack Query sobre os repositórios (`src/data`). As chaves
 * "service", "provider" e "account" são invalidadas quando as stores mudam
 * (ver AppProviders), por isso as listas acompanham o tempo real.
 */
export const queryKeys = {
  clientRequests: (clientId: string) => ["service", "client", clientId] as const,
  nearby: (providerId: string) => ["service", "nearby", providerId] as const,
  providerRequests: (providerId: string) => ["service", "provider", providerId] as const,
  finance: (providerId: string) => ["provider", "finance", providerId] as const,
  transactions: (providerId: string, filter: string) => ["provider", "transactions", providerId, filter] as const,
  reviews: (providerId: string) => ["provider", "reviews", providerId] as const,
  zones: ["provider", "zones"] as const,
  places: (q: string) => ["account", "places", q] as const,
  areas: ["locations", "areas"] as const,
  currentLocation: ["locations", "current"] as const,
  nearbyVehicles: (c?: Coordinates) => ["locations", "vehicles", c?.latitude, c?.longitude] as const,
  help: (q: string, c?: string) => ["support", q, c ?? "all"] as const,
  emergency: ["support", "emergency"] as const,
};

const myProviderId = () => useSessionStore.getState().providerId ?? "";

export const useClientRequests = (clientId: string) =>
  useQuery({ queryKey: queryKeys.clientRequests(clientId), queryFn: () => repositories().requests.list({ clientId }) });

export const useNearbyRequests = () => {
  const providerId = useSessionStore((s) => s.providerId) ?? "";
  return useQuery({ queryKey: queryKeys.nearby(providerId), queryFn: () => repositories().requests.nearby(providerId) });
};

export const useProviderRequests = () => {
  const providerId = useSessionStore((s) => s.providerId) ?? "";
  return useQuery({ queryKey: queryKeys.providerRequests(providerId), queryFn: () => repositories().requests.list({ providerId }) });
};

export const useFinanceSummary = () => {
  const providerId = useSessionStore((s) => s.providerId) ?? "";
  return useQuery({ queryKey: queryKeys.finance(providerId), queryFn: () => repositories().providers.earnings(providerId) });
};

export const useTransactions = (filter: "all" | "earning" | "withdrawal") => {
  const providerId = useSessionStore((s) => s.providerId) ?? "";
  return useQuery({
    queryKey: queryKeys.transactions(providerId, filter),
    queryFn: async () => {
      const { wallet } = await repositories().providers.getState(providerId);
      return wallet.transactions.filter((t) => filter === "all" || t.kind === filter).sort((a, b) => b.at.localeCompare(a.at));
    },
  });
};

export const useProviderReviews = () =>
  useQuery({ queryKey: queryKeys.reviews(myProviderId()), queryFn: () => repositories().providers.reviews(myProviderId()) });

export const useZones = () => useQuery({ queryKey: queryKeys.zones, queryFn: () => repositories().providers.listZones() });

/** Pesquisa de moradas + endereços guardados do cliente que correspondem. */
export const usePlaceSearch = (query: string) =>
  useQuery({
    queryKey: queryKeys.places(query),
    queryFn: async () => {
      const results = await repositories().locations.search(query);
      const q = query.trim().toLowerCase();
      const saved = useAccountStore.getState().addresses.filter((a) => !q || `${a.label} ${a.place.label}`.toLowerCase().includes(q));
      return { saved, results };
    },
    placeholderData: (prev) => prev,
  });

export const useAreas = () => useQuery({ queryKey: queryKeys.areas, queryFn: () => repositories().locations.areas(), staleTime: Infinity });

export const useCurrentLocation = () =>
  useQuery({ queryKey: queryKeys.currentLocation, queryFn: () => repositories().locations.currentLocation(), staleTime: Infinity });

export const useNearbyVehicles = (around?: Coordinates) =>
  useQuery({ queryKey: queryKeys.nearbyVehicles(around), queryFn: () => repositories().locations.nearbyVehicles(around!), enabled: !!around });

export const useHelpSearch = (query: string, category?: HelpTopic["category"]) =>
  useQuery({ queryKey: queryKeys.help(query, category), queryFn: () => repositories().support.searchHelp(query, category), placeholderData: (prev) => prev });

export const useEmergencyContacts = () => useQuery({ queryKey: queryKeys.emergency, queryFn: () => repositories().support.emergencyContacts() });
