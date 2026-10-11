import { useState } from "react";
import { Text, View } from "react-native";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { AppInput } from "@/components/ui/AppInput";
import { AppButton } from "@/components/ui/AppButton";
import { useOrderStore } from "@/stores/useOrderStore";
export default function ChatScreen() {
  const { selectedOrder: order, patchOrder } = useOrderStore();
  const [draft, setDraft] = useState("");
  const send = () => {
    if (!draft.trim()) return;
    patchOrder(order.id, {
      messages: [...(order.messages || []), draft.trim()],
    });
    setDraft("");
  };
  return (
    <ScreenLayout title="Mensagens do pedido" subtitle={order.id}>
      <Text className="text-sm leading-5 text-muted">
        Conversa local de demonstração. As mensagens não são enviadas ao
        parceiro.
      </Text>
      <View className="rounded-2xl bg-white p-4 dark:bg-slate-900">
        <Text className="text-base text-ink dark:text-white">
          Podes deixar aqui detalhes sobre a recolha, a carga ou o acesso ao
          local.
        </Text>
      </View>
      {(order.messages || []).map((message, index) => (
        <View key={index} className="self-end rounded-2xl bg-brand p-4">
          <Text className="text-base text-white">{message}</Text>
          <Text className="mt-2 text-xs text-green-100">
            Guardada nesta sessão
          </Text>
        </View>
      ))}
      <AppInput
        label="Mensagem"
        value={draft}
        onChangeText={setDraft}
        placeholder="Escreve uma mensagem"
        multiline
      />
      <AppButton
        label="Guardar mensagem"
        disabled={!draft.trim()}
        onPress={send}
      />
    </ScreenLayout>
  );
}
