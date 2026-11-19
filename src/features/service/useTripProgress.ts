import { useRef } from "react";
import type { ServiceRequest } from "@/types/domain";
import { distanceKm } from "@/utils/geo";
import { useRoute } from "@/features/map/useRoute";

/**
 * Onde vai o prestador e quanto falta, com a posição real dele
 * (`request.provider.coords`, que a API actualiza) e a rota por estrada:
 * até à recolha antes de a carga ser apanhada, e até à entrega depois.
 */
export function useTripProgress(request: ServiceRequest | undefined) {
  const heading = request && ["pickup_confirmed", "in_transit"].includes(request.status) ? "destination" : "origin";
  const target = request ? (heading === "destination" ? request.destination.coords : request.origin.coords) : undefined;
  const position = request?.provider?.coords;
  const { data: route } = useRoute(position, target);

  // O primeiro troço visto fica como "100 %": o progresso é quanto dele já foi percorrido.
  const initial = useRef<{ id: string; heading: string; km: number } | undefined>(undefined);
  const straightKm = position && target ? distanceKm(position, target) : undefined;
  if (request && straightKm !== undefined && (initial.current?.id !== request.id || initial.current.heading !== heading)) {
    initial.current = { id: request.id, heading, km: Math.max(straightKm, 0.05) };
  }
  const progress = straightKm !== undefined && initial.current ? Math.min(1, Math.max(0, 1 - straightKm / initial.current.km)) : 0;

  return { heading, route, etaMin: route ? Math.max(1, Math.round(route.durationMin)) : undefined, progress };
}
