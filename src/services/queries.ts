import { useQuery } from "@tanstack/react-query";
import { servicesApi } from "./api/services";
import { financeApi } from "./api/finance";
import { placesApi } from "./api/places";
import { supportApi } from "./api/support";

/**
 * Hooks TanStack Query sobre a API simulada. As stores invalidam as chaves
 * "service", "provider" e "account" sempre que mudam (ver AppProviders).
 */
export const queryKeys = {
  clientRequests: (clientId: string) => ["service", "client", clientId] as const,
  nearby: ["service", "nearby"] as const,
  providerRequests: ["service", "provider"] as const,
  finance: ["provider", "finance"] as const,
  transactions: (filter: string) => ["provider", "transactions", filter] as const,
  reviews: ["provider", "reviews"] as const,
  places: (q: string) => ["account", "places", q] as const,
  help: (q: string, c?: string) => ["support", q, c ?? "all"] as const,
};

export const useClientRequests = (clientId: string) =>
  useQuery({ queryKey: queryKeys.clientRequests(clientId), queryFn: () => servicesApi.clientRequests(clientId) });

export const useNearbyRequests = () => useQuery({ queryKey: queryKeys.nearby, queryFn: servicesApi.nearbyRequests });

export const useProviderRequests = () => useQuery({ queryKey: queryKeys.providerRequests, queryFn: servicesApi.providerRequests });

export const useFinanceSummary = () => useQuery({ queryKey: queryKeys.finance, queryFn: financeApi.summary });

export const useTransactions = (filter: "all" | "earning" | "withdrawal") =>
  useQuery({ queryKey: queryKeys.transactions(filter), queryFn: () => financeApi.transactions(filter) });

export const useProviderReviews = () => useQuery({ queryKey: queryKeys.reviews, queryFn: financeApi.reviews });

export const usePlaceSearch = (query: string) =>
  useQuery({ queryKey: queryKeys.places(query), queryFn: () => placesApi.search(query), placeholderData: (prev) => prev });

export const useHelpSearch = (query: string, category?: string) =>
  useQuery({ queryKey: queryKeys.help(query, category), queryFn: () => supportApi.searchHelp(query, category), placeholderData: (prev) => prev });
