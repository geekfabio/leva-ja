import { Text, View } from "react-native";
import { router } from "expo-router";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { AppButton } from "@/components/ui/AppButton";
import { SelectionCard } from "@/components/ui/SelectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriceSummary } from "@/components/orders/PriceSummary";
import { useOrderStore } from "@/stores/useOrderStore";
import { PaymentStatus } from "@/types/order";
const states: [PaymentStatus, string][] = [
  ["pending", "Pendente"],
  ["confirmed", "Confirmado"],
  ["failed", "Falhou"],
  ["refunded", "Reembolsado"],
];
export default function PaymentResult() {
  const { selectedOrder: order, patchOrder } = useOrderStore();
  return (
    <ScreenLayout
      title="Pagamento do pedido"
      subtitle={order.id}
      action={
        <AppButton
          label="Voltar ao pedido"
          onPress={() => router.replace(`/order/${order.id}`)}
        />
      }
    >
      <PriceSummary
        amount={order.amount}
        pricing={order.pricing}
        label={order.paymentMethod || "Forma de pagamento a confirmar"}
      />
      <StatusBadge
        status={
          states.find(([id]) => id === order.paymentStatus)?.[1] || "Pendente"
        }
      />
      <Text className="text-base leading-6 text-muted">
        Simula um estado de pagamento. Nenhuma transacção real será realizada.
      </Text>
      <View accessibilityRole="radiogroup" className="gap-3">
        {states.map(([id, name], index) => (
          <SelectionCard
            key={id}
            title={name}
            icon={<Text className="font-bold text-brand">{index + 1}</Text>}
            selected={id === (order.paymentStatus || "pending")}
            onPress={() => patchOrder(order.id, { paymentStatus: id })}
          />
        ))}
      </View>
    </ScreenLayout>
  );
}
