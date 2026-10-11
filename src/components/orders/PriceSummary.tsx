import { Text, View } from "react-native";
import { money } from "@/domain/catalog";
import { AppCard } from "@/components/ui/AppCard";
export function PriceSummary({
  amount,
  pricing,
  label = "Estimativa do serviço",
}: {
  amount: number;
  pricing?: { base: number; assistance: number; fee: number };
  label?: string;
}) {
  return (
    <AppCard>
      <Text className="text-sm text-muted">{label}</Text>
      <Text className="mt-2 text-4xl font-bold tracking-tight text-ink dark:text-white">
        {money(amount)}
      </Text>
      {pricing ? (
        <View className="mt-5 gap-3 border-t border-line pt-4">
          {[
            ["Transporte / serviço", pricing.base],
            ["Apoio à carga e descarga", pricing.assistance],
            ["Taxa de serviço", pricing.fee],
          ].map(([title, value]) => (
            <View key={title} className="flex-row justify-between gap-3">
              <Text className="flex-1 text-sm text-muted">{title}</Text>
              <Text className="font-semibold text-ink dark:text-white">
                {money(Number(value))}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
      <Text className="mt-4 text-xs leading-5 text-muted">
        Valores de demonstração. O parceiro confirma capacidade e preço antes do
        serviço.
      </Text>
    </AppCard>
  );
}
