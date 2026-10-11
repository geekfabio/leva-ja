import { useRef, useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { Banknote, CreditCard, Ticket } from "lucide-react-native";
import { AppButton } from "@/components/ui/AppButton";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { SelectionCard } from "@/components/ui/SelectionCard";
import { PriceSummary } from "@/components/orders/PriceSummary";
import { useRequestDraft, requestValid } from "@/stores/useRequestDraft";
import { useOrderStore } from "@/stores/useOrderStore";
import { demoEstimate } from "@/domain/catalog";
const methods = [
  { name: "Referência Multicaixa", icon: CreditCard },
  { name: "Numerário", icon: Banknote },
  { name: "Voucher", icon: Ticket },
];
export default function RequestPaymentScreen() {
  const [method, setMethod] = useState(methods[0].name);
  const [error, setError] = useState("");
  const submitted = useRef(false);
  const draft = useRequestDraft();
  const create = useOrderStore((state) => state.createRequest);
  const price = demoEstimate(draft.vehicleType, draft.helpers);
  const confirm = () => {
    if (submitted.current) return;
    submitted.current = true;
    const id = create(draft, method);
    if (!id) {
      submitted.current = false;
      setError("Revê os detalhes da carga e as moradas antes de confirmar.");
      return;
    }
    router.replace({ pathname: "/request/matching", params: { id } } as never);
  };
  return (
    <ScreenLayout
      title="Como queres pagar?"
      subtitle="Passo 6 de 6"
      action={
        <AppButton
          label="Confirmar pedido"
          disabled={!requestValid(draft)}
          onPress={confirm}
        />
      }
    >
      <View accessibilityRole="radiogroup" className="gap-3">
        {methods.map(({ name, icon: Icon }) => (
          <SelectionCard
            key={name}
            title={name}
            icon={<Icon size={22} color="#087F4F" />}
            selected={method === name}
            onPress={() => setMethod(name)}
          />
        ))}
      </View>
      <PriceSummary amount={price.total} pricing={price} />
      {error ? (
        <Text accessibilityRole="alert" className="text-red-700">
          {error}
        </Text>
      ) : null}
      <Text className="text-sm leading-6 text-muted">
        Nenhum pagamento será cobrado. O pedido ficará disponível na área do
        parceiro para demonstrares o serviço.
      </Text>
    </ScreenLayout>
  );
}
