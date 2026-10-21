import { Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { AppButton } from "@/components/ui/AppButton";
import { StateMessage } from "@/components/ui/StateMessage";
import { VehicleArt } from "@/components/transport/VehicleArt";
import { useOrderStore } from "@/stores/useOrderStore";
export default function MatchingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders, selectedOrder, online, updateStatus, cancelOrder } =
    useOrderStore();
  const order = id ? orders.find((item) => item.id === id) : selectedOrder;
  if (!order)
    return (
      <ScreenLayout title="Pedido indisponível">
        <StateMessage
          title="Não encontrámos este pedido"
          description="Volta ao início para criar um transporte."
          action="Voltar ao início"
          onPress={() => router.replace("/legacy")}
        />
      </ScreenLayout>
    );
  return (
    <ScreenLayout title="À procura do parceiro certo" subtitle={order.id}>
      <View className="items-center rounded-3xl bg-brand-soft p-6">
        <VehicleArt vehicle={order.vehicleType || "tow"} size={200} />
        <Text className="text-2xl font-bold text-ink">{order.category}</Text>
        <Text className="mt-3 text-center text-base leading-6 text-muted">
          O teu pedido está criado. Acompanha a atribuição do parceiro ou abre a
          área do parceiro para o aceitar.
        </Text>
      </View>
      <Text className="text-sm text-muted">
        Demonstração local: não são contactados prestadores reais.
      </Text>
      <AppButton
        label="Acompanhar pedido"
        onPress={() => router.replace(`/order/${order.id}`)}
      />
      <AppButton
        label="Abrir pedido como parceiro"
        variant="ghost"
        onPress={() => router.push(`/provider/request/${order.id}` as never)}
      />
      {order.status === "matching" ? (
        <AppButton
          label="Simular parceiro encontrado"
          variant="ghost"
          disabled={!online}
          onPress={() => {
            updateStatus(order.id, "accepted");
            router.replace(`/order/${order.id}`);
          }}
        />
      ) : null}
      <AppButton
        label="Cancelar pedido"
        variant="danger"
        onPress={() => {
          cancelOrder(order.id);
          router.replace("/legacy/orders");
        }}
      />
    </ScreenLayout>
  );
}
