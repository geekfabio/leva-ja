import { useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { SelectionCard } from "@/components/ui/SelectionCard";
import { useOrderStore } from "@/stores/useOrderStore";
const options = [
  "Preço diferente do combinado",
  "Problema com a carga ou o serviço",
  "Comportamento do parceiro",
];
export default function ComplaintScreen() {
  const [reason, setReason] = useState(options[0]);
  const [note, setNote] = useState("");
  const { selectedOrder: order, patchOrder } = useOrderStore();
  return (
    <ScreenLayout
      title="Reportar um problema"
      subtitle={order.id}
      action={
        <AppButton
          label="Registar ocorrência (demo)"
          disabled={note.trim().length < 5}
          onPress={() => {
            patchOrder(order.id, { complaint: { reason, note } });
            router.replace("/order/complaint-status" as never);
          }}
        />
      }
    >
      <View accessibilityRole="radiogroup" className="gap-3">
        {options.map((option, i) => (
          <SelectionCard
            key={option}
            title={option}
            selected={reason === option}
            onPress={() => setReason(option)}
            icon={<Text className="font-bold text-brand">{i + 1}</Text>}
          />
        ))}
      </View>
      <AppInput
        label="O que aconteceu?"
        value={note}
        onChangeText={setNote}
        multiline
        placeholder="Descreve o problema para ficar associado ao pedido."
      />
      <Text className="text-sm leading-6 text-muted">
        Registo local de demonstração. Não é enviada uma mensagem a uma equipa
        de suporte real.
      </Text>
    </ScreenLayout>
  );
}
