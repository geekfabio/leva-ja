import type { Role, ServiceRequest, ServiceStatus } from "@/types/domain";
import { clientScreenFor, isActiveStatus } from "@/features/service/stateMachine";
import { formatKz } from "@/utils/format";
import { clientCopy } from "./build";

export type PushMessage = { title: string; body: string; href?: string };

const providerCopy: Partial<Record<ServiceStatus, (r: ServiceRequest) => [string, string]>> = {
  pickup_confirmed: () => ["Recolha confirmada", "O cliente confirmou a recolha. Podes seguir viagem."],
  paid: (r) => ["Pagamento recebido", `${formatKz(r.providerEarning)} na tua carteira.`],
  rated: (r) => ["Nova avaliação", `O cliente deu ${r.rating ?? 5} estrelas.`],
  cancelled: (r) => ["Pedido cancelado", r.cancelReason ?? `O pedido ${r.code} foi cancelado.`],
};

/**
 * Notificação push que o servidor envia quando um pedido muda de estado, para
 * o cliente ou para o prestador. Usada pela API simulada; o backend real deve
 * enviar textos equivalentes (docs/api.md).
 */
export function pushFor(role: Role, r: ServiceRequest): PushMessage | null {
  if (role === "client") {
    const copy = clientCopy[r.status]?.(r);
    if (!copy) return null;
    return { title: copy[0], body: copy[1], href: isActiveStatus(r.status) ? clientScreenFor[r.status] : `/trip/receipt?id=${r.id}` };
  }
  const copy = providerCopy[r.status]?.(r);
  if (!copy) return null;
  return { title: copy[0], body: copy[1], href: isActiveStatus(r.status) ? `/partner/active/${r.id}` : "/partner/history" };
}
