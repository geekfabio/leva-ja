import type { ProviderDocument, Role, ServiceRequest, ServiceStatus, Transaction } from "@/types/domain";
import { serviceTitle } from "@/features/booking/catalog";
import { clientScreenFor, isActiveStatus } from "@/features/service/stateMachine";
import { currentProvider } from "@/mocks/people";
import { formatKz } from "@/utils/format";

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  at: string;
  kind: "service" | "payment" | "account" | "promo";
  href?: string;
};

const clientCopy: Partial<Record<ServiceStatus, (r: ServiceRequest) => [string, string]>> = {
  assigned: (r) => ["Prestador encontrado", `O teu pedido de ${serviceTitle[r.kind].toLowerCase()} foi aceite.`],
  en_route: (r) => ["Prestador a caminho", `Segue para ${r.origin.area}.`],
  arrived: () => ["O prestador chegou", "Confirma a viatura antes de começar."],
  in_transit: (r) => ["Em transporte", `A caminho de ${r.destination.area}.`],
  delivered: () => ["Serviço concluído", "Escolhe como queres pagar."],
  paid: (r) => ["Pagamento confirmado", `Recibo ${r.code} disponível.`],
  cancelled: (r) => ["Pedido cancelado", r.cancelReason ?? "Não foi cobrado nenhum valor."],
};

/**
 * Notificações simuladas, derivadas dos dados mockados (cronologia dos pedidos,
 * transacções e documentos). Com backend, chegam por push e ficam guardadas na API.
 */
export function buildNotifications(
  role: Role,
  data: { requests: ServiceRequest[]; clientId: string; transactions: Transaction[]; documents: ProviderDocument[] },
): AppNotification[] {
  const items: AppNotification[] = [];
  if (role === "client") {
    for (const r of data.requests.filter((x) => x.clientId === data.clientId)) {
      for (const e of r.timeline) {
        const copy = clientCopy[e.status]?.(r);
        if (!copy) continue;
        items.push({
          id: `${r.id}-${e.status}`,
          title: copy[0],
          body: copy[1],
          at: e.at,
          kind: e.status === "paid" ? "payment" : "service",
          href: isActiveStatus(r.status) ? clientScreenFor[r.status] : `/trip/receipt?id=${r.id}`,
        });
      }
    }
    items.push({ id: "promo-luanda", title: "10% na próxima mudança", body: "Usa o código LUANDA10 até ao fim do mês (demonstração).", at: new Date(Date.now() - 3 * 86_400_000).toISOString(), kind: "promo" });
  } else {
    for (const r of data.requests.filter((x) => x.status === "searching" && !x.providerId).slice(0, 3)) {
      items.push({ id: `new-${r.id}`, title: `Novo pedido: ${serviceTitle[r.kind]}`, body: `${r.origin.area} → ${r.destination.area} · ganho ${formatKz(r.providerEarning)}`, at: r.createdAt, kind: "service", href: `/partner/request/${r.id}` });
    }
    for (const r of data.requests.filter((x) => x.providerId === currentProvider.id && x.proposal?.status === "accepted")) {
      items.push({ id: `prop-${r.id}`, title: "Proposta aceite", body: `O cliente aceitou ${formatKz(r.proposal!.amount)}.`, at: r.timeline.at(-1)?.at ?? r.createdAt, kind: "service", href: `/partner/active/${r.id}` });
    }
    for (const t of data.transactions.slice(0, 4)) {
      items.push({ id: `tx-${t.id}`, title: t.kind === "withdrawal" ? "Levantamento" : "Ganho recebido", body: `${t.title} · ${formatKz(Math.abs(t.amount))}${t.status === "pending" ? " (pendente)" : ""}`, at: t.at, kind: "payment", href: "/partner/transactions" });
    }
    for (const d of data.documents.filter((x) => x.state !== "verified")) {
      items.push({ id: `doc-${d.id}-${d.state}`, title: d.state === "pending" ? "Documento em análise" : "Documento por actualizar", body: d.title, at: new Date(Date.now() - 86_400_000).toISOString(), kind: "account", href: "/partner/documents" });
    }
  }
  return items.sort((a, b) => b.at.localeCompare(a.at));
}
