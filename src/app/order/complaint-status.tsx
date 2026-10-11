import { Text } from "react-native";
import { router } from "expo-router";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { AppCard } from "@/components/ui/AppCard";
import { AppButton } from "@/components/ui/AppButton";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useOrderStore } from "@/stores/useOrderStore";
export default function ComplaintStatus() {
  const order = useOrderStore((state) => state.selectedOrder);
  return (
    <ScreenLayout
      title="Ocorrência do pedido"
      subtitle={order.id}
      action={
        <AppButton
          label="Voltar ao pedido"
          onPress={() => router.replace(`/order/${order.id}`)}
        />
      }
    >
      <AppCard>
        <StatusBadge
          status={order.complaint ? "Registado" : "Sem ocorrência"}
        />
        <Text className="mt-4 text-xl font-bold text-ink dark:text-white">
          {order.complaint?.reason || "Ainda não há uma ocorrência registada."}
        </Text>
        <Text className="mt-3 text-base leading-6 text-muted">
          {order.complaint?.note}
        </Text>
      </AppCard>
      <Text className="text-sm leading-6 text-muted">
        Este registo está guardado apenas na sessão de demonstração. Não há
        análise por um agente real.
      </Text>
    </ScreenLayout>
  );
}
