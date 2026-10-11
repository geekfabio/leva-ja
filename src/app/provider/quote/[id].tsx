import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { StateMessage } from "@/components/ui/StateMessage";
import { PriceSummary } from "@/components/orders/PriceSummary";
import { useOrderStore } from "@/stores/useOrderStore";
export default function QuoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders, patchOrder } = useOrderStore();
  const order = orders.find((item) => item.id === id);
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const amount = Number(price.replace(/\s/g, "").replace(",", "."));
  if (!order)
    return (
      <ScreenLayout title="Proposta">
        <StateMessage
          title="Pedido não encontrado"
          description="Escolhe um pedido para enviar uma proposta."
        />
      </ScreenLayout>
    );
  return (
    <ScreenLayout
      title="Proposta de preço"
      subtitle={order.id}
      action={
        <AppButton
          label="Enviar proposta ao cliente (demo)"
          disabled={
            !Number.isFinite(amount) ||
            amount <= 0 ||
            note.trim().length < 5 ||
            ["completed", "cancelled", "disputed"].includes(order.status)
          }
          onPress={() => {
            patchOrder(order.id, {
              proposedAmount: amount,
              proposalNote: note,
            });
            router.back();
          }}
        />
      }
    >
      <PriceSummary amount={order.amount} pricing={order.pricing} />
      <AppInput
        label="Novo valor total (Kz)"
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
        placeholder="Ex.: 25000"
      />
      <AppInput
        label="Motivo do ajuste"
        value={note}
        onChangeText={setNote}
        multiline
        placeholder="Explica a diferença ao cliente."
        hint="O valor actual só muda quando o cliente aceitar a proposta."
      />
    </ScreenLayout>
  );
}
