import { useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { AppButton } from "@/components/ui/AppButton";
import { SelectionCard } from "@/components/ui/SelectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ProofRow } from "@/components/ui/ProofRow";
import { VehicleArt } from "@/components/transport/VehicleArt";
export default function ProviderOnboarding() {
  const [state, setState] = useState("Pendente");
  return (
    <ScreenLayout
      title="Vamos preparar a tua conta"
      subtitle="Documentos e aprovação"
      action={
        <AppButton
          label="Continuar para entrar"
          disabled={state !== "Aprovado"}
          onPress={() => router.push("/(auth)/phone?role=provider" as never)}
        />
      }
    >
      <View className="items-center rounded-3xl bg-brand-soft p-4">
        <VehicleArt vehicle="box" size={170} />
        <Text className="text-xl font-bold text-ink">
          Leva mais oportunidades contigo.
        </Text>
      </View>
      <StatusBadge status={state} />
      <ProofRow
        title="Carta de condução"
        subtitle="Documento de exemplo"
        complete
      />
      <ProofRow
        title="Seguro da viatura"
        subtitle="Em validação na demonstração"
      />
      <ProofRow
        title="Registo da viatura e capacidade de carga"
        subtitle="Em validação na demonstração"
      />
      <Text className="text-sm leading-6 text-muted">
        Nesta demonstração podes alternar o estado da aprovação. Nenhum
        documento é enviado ou validado.
      </Text>
      <View accessibilityRole="radiogroup" className="gap-3">
        {["Pendente", "Aprovado", "Bloqueado"].map((item, i) => (
          <SelectionCard
            key={item}
            title={item}
            icon={<Text className="font-bold text-brand">{i + 1}</Text>}
            selected={state === item}
            onPress={() => setState(item)}
          />
        ))}
      </View>
    </ScreenLayout>
  );
}
