import { useEffect } from "react";
import { Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { ListRow } from "@/components/ui/ListRow";
import { StateMessage } from "@/components/ui/StateMessage";
import { ServiceSummary } from "@/components/orders/ServiceSummary";
import { PriceSummary } from "@/components/orders/PriceSummary";
import { ServiceTimeline } from "@/components/orders/ServiceTimeline";
import { ContactActions } from "@/components/orders/ContactActions";
import { ProviderStatusPill } from "@/components/provider/ProviderStatusPill";
import { useOrderStore } from "@/stores/useOrderStore";
import { getService } from "@/domain/catalog";
import type { OrderStatus } from "@/types/order";
const next: Partial<Record<OrderStatus, [OrderStatus, string]>> = {
  matching: ["accepted", "Aceitar pedido"],
  accepted: ["on_the_way", "Iniciar deslocação"],
  on_the_way: ["arrived", "Confirmar chegada"],
  arrived: ["service_started", "Iniciar serviço"],
  service_started: ["completed", "Concluir serviço"],
};
export default function ProviderRequest() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders, online, selectOrder, updateStatus } = useOrderStore();
  const order = orders.find((item) => item.id === id);
  useEffect(() => {
    if (id) selectOrder(id);
  }, [id, selectOrder]);
  if (!order)
    return (
      <ScreenLayout title="Pedido">
        <StateMessage
          title="Pedido não encontrado"
          description="Consulta os pedidos disponíveis."
          action="Ver pedidos"
          onPress={() => router.replace("/provider/requests" as never)}
        />
      </ScreenLayout>
    );
  const cargo = getService(order.serviceId || "tow").transport;
  const action = next[order.status];
  const advance = () => {
    if (!action) return;
    updateStatus(order.id, action[0]);
    if (action[0] === "on_the_way")
      router.push(`/provider/navigation/${order.id}` as never);
  };
  return (
    <ScreenLayout
      title="Detalhes do serviço"
      subtitle={order.id}
      action={
        action ? (
          <AppButton
            label={
              order.status === "arrived" && cargo
                ? "Confirmar carga e partir"
                : order.status === "service_started" && cargo
                  ? "Confirmar entrega"
                  : action[1]
            }
            disabled={order.status === "matching" && !online}
            onPress={advance}
          />
        ) : (
          <AppButton
            label="Ver histórico"
            onPress={() => router.push("/provider/history" as never)}
          />
        )
      }
    >
      <ProviderStatusPill status={order.status} />
      {!online && order.status === "matching" ? (
        <Text className="text-sm text-amber-700">
          Estás offline. Activa a disponibilidade no painel para aceitar.
        </Text>
      ) : null}
      <ServiceSummary
        service={order.category}
        vehicle={order.vehicleType || "tow"}
        origin={order.address}
        destination={order.destination}
        description={
          cargo
            ? `${order.cargoDescription || ""} · ${order.weightKg || "A confirmar"} kg · ${order.dimensions || "Dimensões a confirmar"}`
            : order.vehicle
        }
      />
      <PriceSummary amount={order.amount} pricing={order.pricing} />
      <AppCard>
        <Text className="text-lg font-bold text-ink dark:text-white">
          Preparação do serviço
        </Text>
        <Text className="mt-3 text-sm leading-6 text-muted">
          {order.incidentNote || "Sem notas adicionais."}
        </Text>
        {cargo ? (
          <>
            <Text className="mt-3 text-sm text-muted">
              Apoio à carga: {order.helpers ? "Solicitado" : "Não solicitado"}
            </Text>
            <Text className="mt-2 text-sm text-muted">
              Recolha: {order.pickupAccess || "Acesso a confirmar"}
            </Text>
            <Text className="mt-2 text-sm text-muted">
              Entrega: {order.deliveryAccess || "Acesso a confirmar"}
            </Text>
          </>
        ) : null}
        <Text className="mt-3 text-sm text-muted">
          Referências anexadas: {order.evidence?.length || 0}
        </Text>
      </AppCard>
      <AppCard>
        <ServiceTimeline status={order.status} transport={cargo} />
      </AppCard>
      <ContactActions />
      {action ? (
        <>
          <ListRow
            title="Propor ajuste de preço"
            description="O cliente precisa de aceitar o novo valor."
            onPress={() => router.push(`/provider/quote/${order.id}` as never)}
          />
          <ListRow
            title="Comprovativos do serviço"
            description={`${order.proof?.length || 0} registos de demonstração`}
            onPress={() => router.push(`/provider/proof/${order.id}` as never)}
          />
        </>
      ) : null}
      <AppButton
        label="Ver acompanhamento do cliente"
        variant="ghost"
        onPress={() => router.push(`/order/${order.id}`)}
      />
    </ScreenLayout>
  );
}
