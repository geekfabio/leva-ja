import { router } from "expo-router";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { AppButton } from "@/components/ui/AppButton";
import { ServiceSummary } from "@/components/orders/ServiceSummary";
import { useOrderStore } from "@/stores/useOrderStore";
export default function ConfirmedScreen() {
  const order = useOrderStore((state) => state.selectedOrder);
  return (
    <ScreenLayout
      title="O teu pedido está criado"
      subtitle={order.id}
      action={
        <AppButton
          label="Acompanhar pedido"
          onPress={() => router.replace(`/order/${order.id}`)}
        />
      }
    >
      <ServiceSummary
        service={order.category}
        vehicle={order.vehicleType || "tow"}
        origin={order.address}
        destination={order.destination}
      />
      <AppButton
        label="Voltar ao início"
        variant="ghost"
        onPress={() => router.replace("/")}
      />
    </ScreenLayout>
  );
}
