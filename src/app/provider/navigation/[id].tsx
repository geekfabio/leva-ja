import { router, useLocalSearchParams } from "expo-router";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { AppButton } from "@/components/ui/AppButton";
import { StateMessage } from "@/components/ui/StateMessage";
import { ServiceSummary } from "@/components/orders/ServiceSummary";
import { MockMap } from "@/components/provider/MockMap";
import { useOrderStore } from "@/stores/useOrderStore";
export default function NavigationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders, updateStatus } = useOrderStore();
  const order = orders.find((item) => item.id === id);
  if (!order)
    return (
      <ScreenLayout title="Navegação">
        <StateMessage
          title="Pedido não encontrado"
          description="Volta à lista de pedidos."
        />
      </ScreenLayout>
    );
  return (
    <ScreenLayout
      title="A caminho da recolha"
      subtitle="Rota ilustrativa · sem GPS real"
      action={
        <AppButton
          label="Cheguei ao local"
          disabled={order.status !== "on_the_way"}
          onPress={() => {
            updateStatus(order.id, "arrived");
            router.replace(`/provider/request/${order.id}` as never);
          }}
        />
      }
    >
      <MockMap
        label={order.address}
        detail="Local de recolha indicado pelo cliente"
      />
      <ServiceSummary
        service={order.category}
        vehicle={order.vehicleType || "tow"}
        origin={order.address}
        destination={order.destination}
        description={order.pickupAccess}
      />
    </ScreenLayout>
  );
}
