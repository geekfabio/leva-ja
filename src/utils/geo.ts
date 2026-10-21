import type { Coordinates } from "@/types/domain";

/**
 * Trajecto simulado entre dois pontos: curva suave determinística com alguns
 * desvios, para parecer uma estrada no mapa mock. Substituir pela polilinha da
 * API de rotas na fase de backend.
 */
export function mockRoute(from: Coordinates, to: Coordinates, segments = 24): Coordinates[] {
  const dLat = to.latitude - from.latitude;
  const dLon = to.longitude - from.longitude;
  const seed = Math.abs(Math.sin(from.latitude * 91.7 + to.longitude * 13.3));
  const bend = 0.18 + seed * 0.12;
  return Array.from({ length: segments + 1 }, (_, i) => {
    const t = i / segments;
    const wave = Math.sin(t * Math.PI) * bend + Math.sin(t * Math.PI * 3) * 0.04;
    return {
      latitude: from.latitude + dLat * t - dLon * wave * 0.5,
      longitude: from.longitude + dLon * t + dLat * wave * 0.5,
    };
  });
}

/** Ponto ao longo do trajecto (0–1) para posicionar a viatura simulada. */
export function pointAlong(route: Coordinates[], progress: number): Coordinates {
  const clamped = Math.min(1, Math.max(0, progress));
  const index = Math.min(route.length - 1, Math.round(clamped * (route.length - 1)));
  return route[index]!;
}

export function boundsOf(points: Coordinates[], paddingRatio = 0.25) {
  const lats = points.map((p) => p.latitude);
  const lons = points.map((p) => p.longitude);
  let minLat = Math.min(...lats);
  let maxLat = Math.max(...lats);
  let minLon = Math.min(...lons);
  let maxLon = Math.max(...lons);
  const latSpan = Math.max(maxLat - minLat, 0.02);
  const lonSpan = Math.max(maxLon - minLon, 0.02);
  minLat -= latSpan * paddingRatio;
  maxLat += latSpan * paddingRatio;
  minLon -= lonSpan * paddingRatio;
  maxLon += lonSpan * paddingRatio;
  return { minLat, maxLat, minLon, maxLon };
}

export function regionFor(points: Coordinates[]) {
  const b = boundsOf(points, 0.35);
  return {
    latitude: (b.minLat + b.maxLat) / 2,
    longitude: (b.minLon + b.maxLon) / 2,
    latitudeDelta: b.maxLat - b.minLat,
    longitudeDelta: b.maxLon - b.minLon,
  };
}
