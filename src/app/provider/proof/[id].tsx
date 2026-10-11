import { Text, View } from "react-native";
import { Camera } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { AppButton } from "@/components/ui/AppButton";
import { SelectionCard } from "@/components/ui/SelectionCard";
import { StateMessage } from "@/components/ui/StateMessage";
import { useOrderStore } from "@/stores/useOrderStore";
const options = [
  "Estado antes da recolha",
  "Carga ou viatura preparada",
  "Entrega no destino",
  "Confirmação do cliente",
];
export default function ProviderProof() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders, patchOrder } = useOrderStore();
  const order = orders.find((item) => item.id === id);
  if (!order)
    return (
      <ScreenLayout title="Comprovativos">
        <StateMessage
          title="Pedido não encontrado"
          description="Abre um pedido para guardar comprovativos."
        />
      </ScreenLayout>
    );
  const proof = order.proof || [];
  return (
    <ScreenLayout
      title="Comprovativos do serviço"
      subtitle={order.id}
      action={
        <AppButton label="Guardar e voltar" onPress={() => router.back()} />
      }
    >
      <Text className="text-base leading-6 text-muted">
        Marca os registos de exemplo. Não são capturadas fotos ou assinaturas
        reais.
      </Text>
      <View className="gap-3">
        {options.map((label) => (
          <SelectionCard
            role="checkbox"
            key={label}
            title={label}
            icon={<Camera size={22} color="#087F4F" />}
            selected={proof.includes(label)}
            onPress={() =>
              patchOrder(order.id, {
                proof: proof.includes(label)
                  ? proof.filter((item) => item !== label)
                  : [...proof, label],
              })
            }
          />
        ))}
      </View>
    </ScreenLayout>
  );
}
