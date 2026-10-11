import { router } from "expo-router";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { StateMessage } from "@/components/ui/StateMessage";
import { OrderCard } from "@/components/orders/OrderCard";
import { useOrderStore } from "@/stores/useOrderStore";
export default function ProviderHistory() {
  const { orders, selectOrder } = useOrderStore();
  const history = orders.filter((order) =>
    ["completed", "cancelled", "disputed"].includes(order.status),
  );
  return (
    <ScreenLayout
      title="Histórico de serviços"
      subtitle="Todos os estados de conclusão"
    >
      {history.length ? (
        history.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onPress={() => {
              selectOrder(order.id);
              router.push(`/provider/request/${order.id}` as never);
            }}
          />
        ))
      ) : (
        <StateMessage
          title="O teu histórico começa aqui"
          description="Os serviços concluídos ou cancelados ficam disponíveis nesta área."
        />
      )}
    </ScreenLayout>
  );
}
