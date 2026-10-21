import { useEffect } from "react";
import { Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { StateMessage } from "@/components/ui/StateMessage";
import { ServiceSummary } from "@/components/orders/ServiceSummary";
import { ServiceTimeline } from "@/components/orders/ServiceTimeline";
import { ContactActions } from "@/components/orders/ContactActions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useOrderStore } from "@/stores/useOrderStore";
import { getService, money } from "@/domain/catalog";
export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders, selectOrder, patchOrder } = useOrderStore();
  const order = orders.find((item) => item.id === id);
  useEffect(() => {
    if (id) selectOrder(id);
  }, [id, selectOrder]);
  if (!order)
    return (
      <ScreenLayout title="Pedido">
        <StateMessage
          title="Pedido não encontrado"
          description="Consulta os teus pedidos para continuar."
          action="Ver pedidos"
          onPress={() => router.replace("/legacy/orders")}
        />
      </ScreenLayout>
    );
  const cargo = getService(order.serviceId || "tow").transport;
  const complete = order.status === "completed",
    cancelled = order.status === "cancelled",
    disputed = order.status === "disputed";
  return (
    <ScreenLayout
      title={
        complete
          ? "Serviço concluído"
          : cancelled
            ? "Pedido cancelado"
            : "Acompanhar pedido"
      }
      subtitle={order.id}
    >
      <ServiceSummary
        service={order.category}
        vehicle={order.vehicleType || "tow"}
        origin={order.address}
        destination={order.destination}
        description={
          order.cargoDescription
            ? `${order.cargoDescription} · ${order.weightKg} kg · ${order.dimensions}`
            : order.vehicle
        }
      />
      {cancelled || disputed ? (
        <StateMessage
          title={cancelled ? "Este pedido foi cancelado" : "Pedido em análise"}
          description={
            cancelled
              ? "Podes criar um novo pedido quando precisares."
              : "A equipa de apoio está a analisar a ocorrência."
          }
          action={cancelled ? "Voltar ao início" : "Consultar reclamação"}
          onPress={() =>
            router.push(cancelled ? "/legacy" : ("/order/complaint-status" as never))
          }
        />
      ) : (
        <>
          <AppCard>
            <Text className="mb-5 text-lg font-bold text-ink dark:text-white">
              Cada etapa, à tua vista
            </Text>
            <ServiceTimeline status={order.status} transport={cargo} />
          </AppCard>
          <AppCard>
            <Text className="text-lg font-bold text-ink dark:text-white">
              {order.provider || "À procura de parceiro"}
            </Text>
            <Text className="mb-4 mt-2 text-sm leading-6 text-muted">
              {order.provider
                ? `${order.plate || "Viatura a confirmar"} · ${cargo ? "Transporte de cargas" : "Assistência automóvel"}`
                : "Os contactos ficam disponíveis quando o pedido for aceite."}
            </Text>
            {order.provider ? <ContactActions /> : null}
          </AppCard>
        </>
      )}
      {order.proposedAmount && !complete && !cancelled && !disputed ? (
        <AppCard>
          <Text className="text-lg font-bold text-ink dark:text-white">
            Proposta do parceiro: {money(order.proposedAmount)}
          </Text>
          <Text className="my-3 text-sm text-muted">{order.proposalNote}</Text>
          <AppButton
            label="Aceitar valor na demonstração"
            onPress={() =>
              patchOrder(order.id, {
                amount: order.proposedAmount,
                proposedAmount: undefined,
                pricing: undefined,
              })
            }
          />
        </AppCard>
      ) : null}
      <Text className="text-xl font-bold text-ink dark:text-white">
        Valor do serviço · {money(order.amount)}
      </Text>
      <AppButton
        label="Ver pagamento"
        variant="ghost"
        onPress={() => router.push("/request/payment-result" as never)}
      />
      <StatusBadge
        status={
          {
            confirmed: "Confirmado",
            failed: "Falhou",
            refunded: "Reembolsado",
            pending: "Pendente",
          }[order.paymentStatus || "pending"]
        }
      />
      {complete ? (
        <>
          <AppButton
            label="Ver resumo e recibo"
            onPress={() => router.push("/order/receipt")}
          />
          <AppButton
            label="Avaliar serviço"
            variant="ghost"
            onPress={() => router.push("/order/rate")}
          />
        </>
      ) : !cancelled && !disputed ? (
        <>
          <AppButton
            label="Abrir execução do parceiro (demo)"
            variant="ghost"
            onPress={() =>
              router.push(`/provider/request/${order.id}` as never)
            }
          />
          <AppButton
            label="Cancelar pedido"
            variant="danger"
            onPress={() => router.push("/order/cancel")}
          />
        </>
      ) : null}
      <AppButton
        label="Ajuda e segurança"
        variant="ghost"
        onPress={() => router.push("/order/sos")}
      />
    </ScreenLayout>
  );
}
