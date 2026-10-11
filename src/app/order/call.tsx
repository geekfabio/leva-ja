import { useState } from "react";
import { Text } from "react-native";
import { router } from "expo-router";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { AppButton } from "@/components/ui/AppButton";
import { StateMessage } from "@/components/ui/StateMessage";
import { useOrderStore } from "@/stores/useOrderStore";
export default function CallScreen() {
  const order = useOrderStore((state) => state.selectedOrder);
  const [simulated, setSimulated] = useState(false);
  return (
    <ScreenLayout
      title="Contacto do parceiro"
      subtitle={order.id}
      action={
        <AppButton label="Voltar ao pedido" onPress={() => router.back()} />
      }
    >
      <StateMessage
        title={order.provider || "Parceiro ainda não atribuído"}
        description={
          simulated
            ? "Demonstração concluída. Nenhuma chamada foi efectuada."
            : "O contacto telefónico é apenas demonstrativo. Nenhum número real é marcado."
        }
      />
      <Text className="text-base text-muted">{order.category}</Text>
      <AppButton
        label="Simular chamada"
        disabled={!order.provider || simulated}
        variant="ghost"
        onPress={() => setSimulated(true)}
      />
    </ScreenLayout>
  );
}
