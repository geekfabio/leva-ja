import { Text, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { AppButton } from "@/components/ui/AppButton";
import { BrandMark } from "@/components/ui/BrandMark";
import { VehicleArt } from "@/components/transport/VehicleArt";
export default function WelcomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-slate-950">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 24,
          maxWidth: 560,
          width: "100%",
          alignSelf: "center",
        }}
      >
        <BrandMark />
        <View className="my-7 flex-1 overflow-hidden rounded-3xl bg-brand-bright p-6">
          <Text className="text-xs font-bold tracking-widest text-ink">
            CARGAS · MUDANÇAS · ASSISTÊNCIA
          </Text>
          <Text className="mt-6 text-4xl font-bold tracking-tight text-ink">
            Leva o que{"\n"}importa.
          </Text>
          <Text className="mt-4 text-base leading-6 text-ink">
            Da pickup para pequenas cargas ao camião para a tua mudança. E apoio
            quando a viatura precisa.
          </Text>
          <View className="items-center">
            <VehicleArt vehicle="box" size={235} />
          </View>
          <Text className="text-sm font-semibold text-ink">
            Em Luanda, a tua próxima viagem começa aqui.
          </Text>
        </View>
        <View className="gap-3">
          <AppButton
            label="Começar"
            onPress={() => router.push("/(auth)/phone")}
          />
          <AppButton
            label="Sou parceiro"
            variant="ghost"
            onPress={() => router.push("/provider/login" as never)}
          />
          <AppButton
            label="Experimentar demonstração"
            variant="ghost"
            onPress={() => router.push("/demo" as never)}
          />
          <Text className="text-center text-sm text-muted">
            Dados fictícios · sem pagamentos reais
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
