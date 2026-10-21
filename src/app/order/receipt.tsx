import { Share } from "react-native";
import { router } from "expo-router";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { AppButton } from "@/components/ui/AppButton";
import { ServiceSummary } from "@/components/orders/ServiceSummary";
import { PriceSummary } from "@/components/orders/PriceSummary";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useOrderStore } from "@/stores/useOrderStore";
import { money } from "@/domain/catalog";
export default function ReceiptScreen() {
  const order = useOrderStore((state) => state.selectedOrder);
  return (
    <ScreenLayout
      title="Resumo do serviço"
      subtitle={order.id}
      action={
        <AppButton
          label="Ver os meus pedidos"
          onPress={() => router.replace("/legacy/orders")}
        />
      }
    >
      <ServiceSummary
        service={order.category}
        vehicle={order.vehicleType || "tow"}
        origin={order.address}
        destination={order.destination}
      />
      <PriceSummary
        amount={order.amount}
        pricing={order.pricing}
        label={
          order.paymentStatus === "confirmed"
            ? "Pagamento confirmado (demo)"
            : "Valor do serviço · pagamento pendente"
        }
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
      <AppButton
        label="Partilhar resumo"
        variant="ghost"
        onPress={() => {
          void Share.share({
            message: `Leva Já — demonstração\nPedido ${order.id}\n${order.category}\n${order.address} → ${order.destination || "Serviço no local"}\n${money(order.amount)} · ${order.paymentMethod || "Pagamento a confirmar"}\nEste resumo não é um recibo fiscal.`,
          });
        }}
      />
      <AppButton
        label="Reportar um problema"
        variant="ghost"
        onPress={() => router.push("/order/complaint")}
      />
    </ScreenLayout>
  );
}
