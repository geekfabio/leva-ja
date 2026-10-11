import { VehicleArt } from "@/components/transport/VehicleArt";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { BadgeCheck, Banknote, Truck } from "lucide-react-native";
import { AuthScaffold } from "@/components/ui/AuthScaffold";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";

export default function ProviderLogin() {
  return (
    <AuthScaffold
      title="Mais oportunidades. Ao teu ritmo."
      description="A tua área de parceiro Leva Já. Gere pedidos, acompanha os serviços e consulta os teus ganhos."
    >
      <View className="mb-6 rounded-3xl bg-ink p-6">
        <View className="mb-6 h-24 w-28 items-center justify-center rounded-2xl bg-brand-bright">
          <VehicleArt vehicle="heavy" size={100} />
        </View>
        <Text className="text-2xl font-bold text-white">
          Cada serviço conta.
        </Text>
        <Text className="mt-2 text-base leading-6 text-slate-300">
          Transporta cargas, faz mudanças e presta apoio na estrada.
        </Text>
      </View>
      <AppCard>
        <View className="flex-row items-center gap-3">
          <BadgeCheck size={22} color="#087F4F" />
          <Text className="flex-1 text-sm text-ink dark:text-white">
            Pedidos com os detalhes de que precisas
          </Text>
        </View>
        <View className="mt-4 flex-row items-center gap-3">
          <Banknote size={22} color="#087F4F" />
          <Text className="flex-1 text-sm text-ink dark:text-white">
            Serviços e ganhos num só lugar
          </Text>
        </View>
      </AppCard>
      <View className="mt-6 gap-3">
        <AppButton
          label="Entrar como parceiro"
          onPress={() => router.push("/(auth)/phone?role=provider" as never)}
        />
        <AppButton
          label="Quero ser parceiro"
          variant="ghost"
          onPress={() => router.push("/provider/onboarding" as never)}
        />
      </View>
      <Text className="mt-5 text-center text-xs leading-5 text-muted">
        Demonstração: +244 923 456 789 · código 123456
      </Text>
    </AuthScaffold>
  );
}
