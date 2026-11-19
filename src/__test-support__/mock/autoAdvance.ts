import type { ServiceStatus } from "@/types/domain";

/**
 * Prestador simulado do e2e: depois de cada estado, o "servidor" avança o
 * pedido sozinho (como faria um prestador real). Só o e2e o liga
 * (src/__test-support__/bootstrap.ts); a app em si nunca avança estados.
 */
export const autoAdvanceSteps: Partial<Record<ServiceStatus, { to: ServiceStatus; afterMs: number }>> = {
  searching: { to: "assigned", afterMs: 4000 },
  assigned: { to: "en_route", afterMs: 2500 },
  en_route: { to: "arrived", afterMs: 15000 },
  pickup_confirmed: { to: "in_transit", afterMs: 3000 },
  in_transit: { to: "delivered", afterMs: 15000 },
};
