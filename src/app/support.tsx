import { Text } from "react-native";
import { router } from "expo-router";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { AppCard } from "@/components/ui/AppCard";
import { ListRow } from "@/components/ui/ListRow";
const topics = [
  [
    "Qual viatura devo escolher?",
    "Pickup para pequenos volumes, carrinha para carga protegida, camião fechado para mudanças e camião de carga pesada para mercadorias volumosas. Indica peso e dimensões para o parceiro confirmar a capacidade.",
  ],
  [
    "O parceiro ajuda a carregar?",
    "Podes pedir apoio à carga e descarga nos detalhes do pedido. Indica também andares, elevadores e dificuldades de acesso.",
  ],
  [
    "Como funciona o reboque?",
    "Escolhe reboque, descreve a viatura e o problema e confirma o local. Podes indicar o destino ou combiná-lo com o parceiro.",
  ],
  [
    "Já foi feito algum pagamento?",
    "Nesta demonstração não são cobrados pagamentos. O estado do pagamento é apresentado no resumo de cada pedido.",
  ],
];
export default function SupportScreen() {
  return (
    <ScreenLayout
      title="Como podemos ajudar?"
      subtitle="Transporte, mudanças e assistência"
    >
      {topics.map(([title, body]) => (
        <AppCard key={title}>
          <Text className="text-lg font-bold text-ink dark:text-white">
            {title}
          </Text>
          <Text className="mt-3 text-sm leading-6 text-muted">{body}</Text>
        </AppCard>
      ))}
      <ListRow
        title="Preciso de ajuda com um pedido"
        description="Escolhe o pedido e consulta os contactos."
        onPress={() => router.push("/legacy/orders")}
      />
      <ListRow
        title="Ajuda e segurança"
        description="Consultar o fluxo SOS de demonstração."
        onPress={() => router.push("/order/sos")}
      />
    </ScreenLayout>
  );
}
