import type { ServiceRequest } from "@/types/domain";
import { currentProvider } from "@/mocks/people";
import { placeList, roadDistanceKm } from "@/mocks/places";
import { useServiceStore } from "@/stores/useServiceStore";
import { useProviderStore } from "@/stores/useProviderStore";
import { mockRequest } from "./mockClient";

const requests = () => useServiceStore.getState().requests;
const byNewest = (a: ServiceRequest, b: ServiceRequest) => b.createdAt.localeCompare(a.createdAt);

export type NearbyRequest = { request: ServiceRequest; distanceKm: number };

/** Distância simulada do prestador à recolha. */
export function distanceFromProvider(request: ServiceRequest) {
  const providerPlace = placeList.find((p) => p.id === "maculusso")!;
  return roadDistanceKm(providerPlace, request.origin) - 1;
}

export const servicesApi = {
  clientRequests: (clientId: string) =>
    mockRequest(() => requests().filter((r) => r.clientId === clientId).sort(byNewest)),

  /** Pedidos sem prestador, dentro dos serviços aceites e não recusados pelo prestador. */
  nearbyRequests: () =>
    mockRequest<NearbyRequest[]>(() => {
      const { services } = useProviderStore.getState();
      const { declined } = useServiceStore.getState();
      return requests()
        .filter((r) => r.status === "searching" && !declined.includes(r.id) && services.includes(r.kind))
        .filter((r) => !r.proposal || r.proposal.status === "declined")
        .map((request) => ({ request, distanceKm: Math.max(1, distanceFromProvider(request)) }))
        .sort((a, b) => a.distanceKm - b.distanceKm);
    }),

  /** Pedidos já atribuídos ao prestador (em curso, aguardar proposta ou concluídos). */
  providerRequests: () =>
    mockRequest(() => requests().filter((r) => r.providerId === currentProvider.id).sort(byNewest)),
};
