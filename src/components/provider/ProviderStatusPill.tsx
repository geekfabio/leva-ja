import type { OrderStatus } from "@/types/order";
import { StatusBadge } from "@/components/ui/StatusBadge";
const labels: Record<OrderStatus, string> = {
  draft: "Rascunho",
  matching: "Disponível",
  accepted: "Aceite",
  on_the_way: "A caminho",
  arrived: "No local",
  service_started: "Em serviço",
  completed: "Concluído",
  cancelled: "Cancelado",
  disputed: "Em disputa",
};
export function ProviderStatusPill({ status }: { status: OrderStatus }) {
  return <StatusBadge status={labels[status]} />;
}
