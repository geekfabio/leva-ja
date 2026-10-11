import { useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { AuthScaffold } from "@/components/ui/AuthScaffold";
import { AppButton } from "@/components/ui/AppButton";
import { ProgressDots } from "@/components/ui/ProgressDots";
import { VehicleArt } from "@/components/transport/VehicleArt";
import type { VehicleId } from "@/domain/catalog";
const slides: { title: string; description: string; vehicle: VehicleId }[] = [
  {
    title: "Pequena carga. Grande ajuda.",
    description:
      "Escolhe uma pickup ou carrinha para levar caixas, compras e pequenos móveis.",
    vehicle: "pickup",
  },
  {
    title: "A tua próxima casa começa aqui.",
    description:
      "Planeia a mudança, indica os volumes e pede apoio para carregar e descarregar.",
    vehicle: "box",
  },
  {
    title: "Também estamos na estrada contigo.",
    description: "Pede reboque ou apoio para bateria, pneus e combustível.",
    vehicle: "tow",
  },
];
export default function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  return (
    <AuthScaffold
      title={slide.title}
      description={slide.description}
      footer={
        <AppButton
          label={index === 2 ? "Começar" : "Continuar"}
          onPress={() =>
            index === 2 ? router.replace("/(auth)/phone") : setIndex(index + 1)
          }
        />
      }
    >
      <View className="items-center rounded-3xl bg-brand-soft py-5">
        <VehicleArt vehicle={slide.vehicle} size={240} />
      </View>
      <View className="mt-6">
        <ProgressDots total={3} current={index} />
      </View>
      <Text className="mt-6 text-center text-sm text-muted">
        Transportes, mudanças e assistência em Luanda.
      </Text>
    </AuthScaffold>
  );
}
