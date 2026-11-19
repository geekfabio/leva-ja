import type { ServiceRequest } from "@/types/domain";
import type { RequestInput } from "@/features/booking/factory";
import { statusFlow } from "@/features/service/stateMachine";
import { estimateMinutes, roadDistanceKm } from "./geo";
import { estimatePrice, providerEarningFor } from "./pricing";

let sequence = 20841;

/** Cria um pedido completo (distância, preço, ganho e cronologia) a partir dos dados do formulário. */
export function buildRequest(input: RequestInput): ServiceRequest {
  const distanceKm = roadDistanceKm(input.origin, input.destination);
  const price = estimatePrice({
    kind: input.kind,
    distanceKm,
    tow: input.tow,
    cargo: input.cargo,
    moving: input.moving,
  });
  const status = input.status ?? "searching";
  const createdAt = input.createdAt ?? new Date().toISOString();
  const reached = status === "cancelled" ? ["searching" as const] : statusFlow.slice(0, statusFlow.indexOf(status) + 1);
  const base = new Date(createdAt).getTime();
  const number = sequence++;
  return {
    id: input.id ?? `req-${number}`,
    code: `AL-${number}`,
    kind: input.kind,
    status,
    clientId: input.clientId,
    providerId: input.providerId,
    origin: input.origin,
    destination: input.destination,
    stops: input.stops ?? [],
    distanceKm,
    durationMin: estimateMinutes(distanceKm),
    createdAt,
    scheduledFor: input.scheduledFor,
    tow: input.tow,
    cargo: input.cargo,
    moving: input.moving,
    photos: input.photos ?? [],
    pickupPhotos: input.pickupPhotos ?? [],
    instructions: input.instructions,
    price,
    providerEarning: providerEarningFor(price),
    paymentMethod: input.paymentMethod,
    rating: input.rating,
    review: input.review,
    timeline: [
      ...reached.map((s, i) => ({ status: s, at: new Date(base + i * 7 * 60_000).toISOString() })),
      ...(status === "cancelled" ? [{ status: "cancelled" as const, at: new Date(base + 5 * 60_000).toISOString() }] : []),
    ],
  };
}
