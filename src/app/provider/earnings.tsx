import { Text, View } from "react-native";
import { router } from "expo-router";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { AppCard } from "@/components/ui/AppCard";
import { ListRow } from "@/components/ui/ListRow";
import { StateMessage } from "@/components/ui/StateMessage";
import { useOrderStore } from "@/stores/useOrderStore";
import { money } from "@/domain/catalog";
export default function EarningsScreen() {
  const { orders, selectOrder } = useOrderStore();
  const completed = orders.filter((order) => order.status === "completed");
  const confirmed = completed
    .filter((order) => order.paymentStatus === "confirmed")
    .reduce((sum, order) => sum + order.amount, 0);
  const total = completed.reduce((sum, order) => sum + order.amount, 0);
  return (
    <ScreenLayout
      title="Ganhos e serviços"
      subtitle="Resumo dos pedidos de demonstração"
    >
      <View className="rounded-3xl bg-ink p-6">
        <Text className="text-sm text-slate-300">
          Valor dos serviços concluídos
        </Text>
        <Text className="mt-3 text-4xl font-bold text-white">
          {money(total)}
        </Text>
        <Text className="mt-3 text-sm text-slate-300">
          {completed.length} serviços · sem dedução de comissões
        </Text>
      </View>
      <AppCard>
        <Text className="font-bold text-ink dark:text-white">
          Pagamentos confirmados: {money(confirmed)}
        </Text>
        <Text className="mt-2 text-sm leading-5 text-muted">
          Os restantes pagamentos ainda não estão confirmados. Estes valores não
          representam saldo disponível para levantamento.
        </Text>
      </AppCard>
      {completed.length ? (
        completed.map((order) => (
          <ListRow
            key={order.id}
            title={order.category}
            description={`${order.id} · ${money(order.amount)}`}
            onPress={() => {
              selectOrder(order.id);
              router.push(`/provider/request/${order.id}` as never);
            }}
          />
        ))
      ) : (
        <StateMessage
          title="Ainda não há serviços concluídos"
          description="Os teus ganhos aparecem aqui quando terminares um serviço."
        />
      )}
    </ScreenLayout>
  );
}
