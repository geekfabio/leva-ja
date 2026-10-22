import type { Role, ServiceStatus } from "@/types/domain";

/**
 * Máquina de estados do serviço partilhada por cliente e prestador.
 * Fluxo feliz: procura → atribuído → a caminho → no local → recolha confirmada
 * → em transporte → entregue → pago → avaliado. Cancelamento só é possível
 * antes da recolha.
 */
export const statusFlow: ServiceStatus[] = [
  "searching",
  "assigned",
  "en_route",
  "arrived",
  "pickup_confirmed",
  "in_transit",
  "delivered",
  "paid",
  "rated",
];

const cancellable: ServiceStatus[] = ["searching", "assigned", "en_route", "arrived"];

/** Quem executa cada transição (para validar acções no mock e, no futuro, na API). */
export const transitionActor: Partial<Record<ServiceStatus, Role | "system">> = {
  assigned: "provider",
  en_route: "provider",
  arrived: "provider",
  pickup_confirmed: "client",
  in_transit: "provider",
  delivered: "provider",
  paid: "client",
  rated: "client",
};

export function nextStatus(status: ServiceStatus): ServiceStatus | undefined {
  const index = statusFlow.indexOf(status);
  return index >= 0 ? statusFlow[index + 1] : undefined;
}

export function canTransition(from: ServiceStatus, to: ServiceStatus) {
  if (to === "cancelled") return cancellable.includes(from);
  return nextStatus(from) === to;
}

export const isCancellable = (status: ServiceStatus) => cancellable.includes(status);

/** Pedido em curso: ainda requer acção ou acompanhamento. */
export const isActiveStatus = (status: ServiceStatus) =>
  !["paid", "rated", "cancelled"].includes(status);

export const isFinishedStatus = (status: ServiceStatus) =>
  ["delivered", "paid", "rated"].includes(status);

export const statusLabel: Record<ServiceStatus, string> = {
  searching: "A procurar prestador",
  assigned: "Prestador atribuído",
  en_route: "A caminho",
  arrived: "No local",
  pickup_confirmed: "Recolha confirmada",
  in_transit: "Em transporte",
  delivered: "Entregue",
  paid: "Pago",
  rated: "Concluído",
  cancelled: "Cancelado",
};

export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

export const statusTone: Record<ServiceStatus, StatusTone> = {
  searching: "warning",
  assigned: "info",
  en_route: "info",
  arrived: "success",
  pickup_confirmed: "success",
  in_transit: "info",
  delivered: "success",
  paid: "success",
  rated: "success",
  cancelled: "neutral",
};

/**
 * Transições que o cliente vê acontecer sozinhas na simulação (equivalem a
 * eventos que chegarão por push/websocket quando houver backend).
 */
export const clientAutoAdvance: Partial<Record<ServiceStatus, { to: ServiceStatus; afterMs: number }>> = {
  searching: { to: "assigned", afterMs: 4000 },
  assigned: { to: "en_route", afterMs: 2500 },
  en_route: { to: "arrived", afterMs: 15000 },
  pickup_confirmed: { to: "in_transit", afterMs: 3000 },
  in_transit: { to: "delivered", afterMs: 15000 },
};

/** Ecrã do cliente que corresponde a cada estado. */
export const clientScreenFor: Record<ServiceStatus, string> = {
  searching: "/trip/matching",
  assigned: "/trip/found",
  en_route: "/trip/tracking",
  arrived: "/trip/arrived",
  pickup_confirmed: "/trip/in-transit",
  in_transit: "/trip/in-transit",
  delivered: "/trip/payment",
  paid: "/trip/receipt",
  rated: "/trip/receipt",
  cancelled: "/trips",
};

/** Acção principal do prestador em cada estado do serviço activo. */
export const providerAction: Partial<Record<ServiceStatus, { label: string; to: ServiceStatus | "proof" }>> = {
  assigned: { label: "Iniciar deslocação", to: "en_route" },
  en_route: { label: "Cheguei ao local", to: "arrived" },
  arrived: { label: "Aguardar confirmação do cliente", to: "pickup_confirmed" },
  pickup_confirmed: { label: "Iniciar transporte", to: "in_transit" },
  in_transit: { label: "Confirmar entrega", to: "proof" },
};
