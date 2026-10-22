import { useQuery } from "@tanstack/react-query";
import type { Coordinates } from "@/types/domain";
import { estimateMinutes, mockRoute } from "@/utils/geo";

export type DrivingRoute = {
  coordinates: Coordinates[];
  distanceKm: number;
  durationMin: number;
  /** OSRM é usado quando há rede; mock preserva o fluxo em modo demonstração. */
  source: "osrm" | "mock";
};

const OSRM_DRIVING_URL = "https://router.project-osrm.org/route/v1/driving/";

function straightDistanceKm(from: Coordinates, to: Coordinates) {
  const radians = (value: number) => value * Math.PI / 180;
  const latitude = radians(to.latitude - from.latitude);
  const longitude = radians(to.longitude - from.longitude);
  const value = Math.sin(latitude / 2) ** 2 + Math.cos(radians(from.latitude)) * Math.cos(radians(to.latitude)) * Math.sin(longitude / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(value));
}

function mockDrivingRoute(from: Coordinates, to: Coordinates): DrivingRoute {
  const distanceKm = Math.max(2, Math.round(straightDistanceKm(from, to) * 1.35));
  return {
    coordinates: mockRoute(from, to),
    distanceKm,
    durationMin: estimateMinutes(distanceKm),
    source: "mock",
  };
}

/** Obtém uma rota de automóvel do OSRM, que usa a rede de estradas do OpenStreetMap. */
export async function getDrivingRoute(from: Coordinates, to: Coordinates): Promise<DrivingRoute> {
  try {
    const coordinates = from.longitude + "," + from.latitude + ";" + to.longitude + "," + to.latitude;
    const response = await fetch(OSRM_DRIVING_URL + coordinates + "?overview=full&geometries=geojson&steps=false");
    if (!response.ok) throw new Error("Serviço de rotas indisponível");
    const payload = await response.json();
    const route = payload.routes?.[0];
    if (!route?.geometry?.coordinates?.length || !Number.isFinite(route.distance) || !Number.isFinite(route.duration)) {
      throw new Error("Resposta de rota inválida");
    }
    return {
      coordinates: route.geometry.coordinates.map(([longitude, latitude]: [number, number]) => ({ latitude, longitude })),
      distanceKm: Math.max(1, Math.round(route.distance / 1000)),
      durationMin: Math.max(1, Math.round(route.duration / 60)),
      source: "osrm",
    };
  } catch {
    return mockDrivingRoute(from, to);
  }
}

export function useDrivingRoute(from?: Coordinates, to?: Coordinates) {
  return useQuery({
    queryKey: ["routing", "driving", from?.latitude, from?.longitude, to?.latitude, to?.longitude],
    queryFn: () => getDrivingRoute(from!, to!),
    enabled: Boolean(from && to),
    staleTime: 5 * 60 * 1000,
    retry: 0,
  });
}
