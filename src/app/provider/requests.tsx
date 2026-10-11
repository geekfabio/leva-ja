import { Text, View } from "react-native";
import { router } from "expo-router";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { StateMessage } from "@/components/ui/StateMessage";
import { OrderCard } from "@/components/orders/OrderCard";
import { useOrderStore } from "@/stores/useOrderStore";
export default function ProviderRequests() {
  const { orders, online, setOnline, selectOrder } = useOrderStore();
  const available = orders.filter((order) => order.status === "matching");
  const active = orders.filter((order) =>
    ["accepted", "on_the_way", "arrived", "service_started"].includes(
      order.status,
    ),
  );
  const open = (id: string) => {
    selectOrder(id);
    router.push(`/provider/request/${id}` as never);
  };
  return (
    <ScreenLayout
      title="Os teus pedidos"
      subtitle="Transportes, mudanças e assistência"
    >
      {active.length ? (
        <View>
          <Text className="mb-3 text-lg font-bold text-ink dark:text-white">
            Em curso
          </Text>
          {active.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onPress={() => open(order.id)}
            />
          ))}
        </View>
      ) : null}
      <Text className="text-lg font-bold text-ink dark:text-white">
        Novas oportunidades
      </Text>
      {!online ? (
        <StateMessage
          title="Estás offline"
          description="Activa a disponibilidade para consultar e aceitar novos pedidos."
          action="Ficar online"
          onPress={() => setOnline(true)}
        />
      ) : available.length ? (
        <View>
          {available.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onPress={() => open(order.id)}
            />
          ))}
        </View>
      ) : (
        <StateMessage
          title="Sem novos pedidos por agora"
          description="Os pedidos criados pelo cliente aparecem aqui nesta demonstração."
        />
      )}
    </ScreenLayout>
  );
}
