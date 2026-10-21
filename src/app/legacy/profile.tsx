import { router } from "expo-router";
import { Text, View } from "react-native";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { ListRow } from "@/components/ui/ListRow";
import { AppButton } from "@/components/ui/AppButton";
const entries = [
  ["Os meus pedidos", "Transportes, mudanças e assistência", "/legacy/orders"],
  ["Moradas guardadas", "Locais de recolha e entrega", "/account/addresses"],
  ["Viaturas para assistência", "Dados dos teus veículos", "/account/vehicles"],
  ["Métodos de pagamento", "As tuas opções de pagamento", "/account/payments"],
  ["Ajuda e suporte", "Dúvidas sobre cargas e serviços", "/support"],
  ["Definições", "Preferências da conta", "/account/settings"],
];
export default function ProfileScreen() {
  return (
    <ScreenLayout title="O teu perfil" subtitle="Cliente Leva Já">
      <View className="rounded-3xl bg-ink p-6">
        <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-brand-bright">
          <Text className="text-xl font-bold text-ink">AT</Text>
        </View>
        <Text className="text-2xl font-bold text-white">Armando Trindade</Text>
        <Text className="mt-2 text-sm text-slate-300">
          A tua conta, os teus caminhos.
        </Text>
      </View>
      {entries.map(([title, description, path]) => (
        <ListRow
          key={title}
          title={title}
          description={description}
          onPress={() => router.push(path as never)}
        />
      ))}
      <AppButton
        label="Voltar à entrada"
        variant="ghost"
        onPress={() => router.replace("/welcome")}
      />
    </ScreenLayout>
  );
}
