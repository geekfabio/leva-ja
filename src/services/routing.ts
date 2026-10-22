import { useQuery } from "@tanstack/react-query";
import type { Coordinates, RoutePlan } from "@/types/domain";
import { estimateMinutes, mockRoute } from "@/utils/geo";

const routingBaseUrl = (process.env.EXPO_PUBLIC_ROUTING_URL || "https://router.project-osrm.org").replace(/\/$/, "");

const keyFor = (points: Coordinates[]) =>
  points.map(({ latitude, longitude }) => `${latitude.toFixed(5)},${longitude.toFixed(5)}`).join(";");

function straightDistanceKm(a: Coordinates, b: Coordinates) {
  const radians = (value: number) => (value * Math.PI) / 180;
  const dLat = radians(b.latitude - a.latitude);
  const dLon = radians(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(a.latitude)) * Math.cos(radians(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** Rota aproximada que mantém a aplicação utilizável sem rede/servidor OSRM. */
export function fallbackRoutePlan(points: Coordinates[]): RoutePlan {
  const coordinates = points.slice(0, -1).flatMap((point, index) => {
    const segment = mockRoute(point, points[index + 1]!);
    return index ? segment.slice(1) : segment;
  });
  const distanceKm = Math.max(
    2,
    Math.round(
      points.slice(0, -1).reduce((total, point, index) => total + straightDistanceKm(point, points[index + 1]!), 0) *
        13.5,
    ) / 10,
  );
  return { coordinates, distanceKm, durationMin: estimateMinutes(distanceKm), source: "mock" };
}

type OsrmResponse = {
  code?: string;
  routes?: {
    distance: number;
    duration: number;
    geometry: { coordinates: [number, number][] };
  }[];
};

/** Pede ao OSRM a rota mais rápida para automóveis e devolve GeoJSON normalizado. */
export async function fetchDrivingRoute(points: Coordinates[]): Promise<RoutePlan> {
  if (points.length < 2) throw new Error("São necessários pelo menos dois pontos para calcular a rota.");
  const coordinates = points.map(({ latitude, longitude }) => `${longitude},${latitude}`).join(";");
  const url = `${routingBaseUrl}/route/v1/driving/${coordinates}?alternatives=false&steps=false&overview=full&geometries=geojson`;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`O serviço de rotas respondeu com ${response.status}.`);
  const body = (await response.json()) as OsrmResponse;
  const route = body.routes?.[0];
  if (body.code !== "Ok" || !route?.geometry?.coordinates?.length) throw new Error("Não foi encontrada uma rota rodoviária.");
  return {
    coordinates: route.geometry.coordinates.map(([longitude, latitude]) => ({ latitude, longitude })),
    distanceKm: Math.max(0.1, Math.round(route.distance / 100) / 10),
    durationMin: Math.max(1, Math.round(route.duration / 60)),
    source: "osrm",
  };
}

/** Cacheia rotas iguais e usa uma aproximação local quando o serviço está indisponível. */
export function useDrivingRoute(points: Coordinates[], enabled = true) {
  return useQuery({
    queryKey: ["routing", "driving", keyFor(points)],
    queryFn: async () => {
      try {
        return await fetchDrivingRoute(points);
      } catch {
        return fallbackRoutePlan(points);
      }
    },
    enabled: enabled && points.length >= 2,
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
  });
}

