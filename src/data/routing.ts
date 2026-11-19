import type { Coordinates } from "@/types/domain";
import { env } from "@/config/env";
import { distanceKm } from "@/utils/geo";

export type RouteResult = {
  /** Geometria da rota (da estrada, ou a linha recta quando o serviço de rotas não responde). */
  points: Coordinates[];
  distanceKm: number;
  durationMin: number;
  /** `true` quando é a estimativa em linha recta, não uma rota por estradas. */
  approximate: boolean;
};

/** Trânsito urbano de Luanda e desvio médio entre a linha recta e a estrada. */
const URBAN_SPEED_KMH = 28;
const ROAD_FACTOR = 1.35;
const cache = new Map<string, RouteResult>();

const key = (from: Coordinates, to: Coordinates) => [from.latitude, from.longitude, to.latitude, to.longitude].map((n) => n.toFixed(4)).join(",");

function straightLine(from: Coordinates, to: Coordinates): RouteResult {
  const km = distanceKm(from, to) * ROAD_FACTOR;
  return { points: [from, to], distanceKm: Math.round(km * 10) / 10, durationMin: Math.max(1, Math.round((km / URBAN_SPEED_KMH) * 60)), approximate: true };
}

/**
 * Rota por estrada entre dois pontos (OSRM, `EXPO_PUBLIC_ROUTING_URL`). Com a
 * resposta em cache não volta a pedir; se o serviço falhar, devolve a linha recta.
 */
export async function fetchRoute(from: Coordinates, to: Coordinates): Promise<RouteResult> {
  const id = key(from, to);
  const cached = cache.get(id);
  if (cached) return cached;
  try {
    const url = `${env.routingUrl.replace(/\/$/, "")}/route/v1/driving/${from.longitude},${from.latitude};${to.longitude},${to.latitude}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`OSRM ${response.status}`);
    const body = (await response.json()) as { routes?: { distance: number; duration: number; geometry: { coordinates: [number, number][] } }[] };
    const route = body.routes?.[0];
    if (!route) throw new Error("OSRM sem rota");
    const result: RouteResult = {
      points: route.geometry.coordinates.map(([longitude, latitude]) => ({ latitude, longitude })),
      distanceKm: Math.round((route.distance / 1000) * 10) / 10,
      durationMin: Math.max(1, Math.round(route.duration / 60)),
      approximate: false,
    };
    cache.set(id, result);
    return result;
  } catch {
    return straightLine(from, to);
  }
}
