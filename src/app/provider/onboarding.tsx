import { useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { AppButton } from "@/components/ui/AppButton";
import { SelectionCard } from "@/components/ui/SelectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ProofRow } from "@/components/ui/ProofRow";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { VehicleArt } from "@/components/transport/VehicleArt";

const providerTypes = [
  {
    id: "assistance",
    label: "Assistência",
    emoji: "🚛",
    tone: ["#22C55E", "#15803D"] as const,
  },
  {
    id: "transport",
    label: "Transportador",
    emoji: "🚚",
    tone: ["#16A34A", "#102018"] as const,
  },
] as const;

const proofsByType: Record<
  (typeof providerTypes)[number]["id"],
  { title: string; subtitle: string; complete: boolean }[]
> = {
  assistance: [
    { title: "Carta de condução", subtitle: "Válida até 2031", complete: true },
    { title: "Seguro da viatura", subtitle: "Em validação", complete: false },
    { title: "Registo do reboque", subtitle: "Em validação", complete: false },
  ],
  transport: [
    { title: "Carta de condução", subtitle: "Válida até 2031", complete: true },
    {
      title: "Seguro da viatura de carga",
      subtitle: "Em validação",
      complete: false,
    },
    {
      title: "Registo da viatura de carga",
      subtitle: "Em validação",
      complete: false,
    },
    {
      title: "Comprovativo de capacidade de carga",
      subtitle: "Peso/volume máximo suportado",
      complete: false,
    },
  ],
};

export default function ProviderOnboarding() {
  const [state, setState] = useState("Pendente");
  const [type, setType] =
    useState<(typeof providerTypes)[number]["id"]>("assistance");
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
      <Text className="font-black text-ink dark:text-white">
        Tipo de prestador
      </Text>
      <View className="flex-row gap-3">
        {providerTypes.map(({ id, label, emoji, tone }) => (
          <SelectionCard
            key={id}
            title={label}
            icon={<ServiceIcon emoji={emoji} tone={tone} size={36} />}
            selected={type === id}
            onPress={() => setType(id)}
          />
        ))}
      </View>
      <StatusBadge status={state} />
      {proofsByType[type].map((proof) => (
        <ProofRow
          key={proof.title}
          title={proof.title}
          subtitle={proof.subtitle}
          complete={proof.complete}
        />
      ))}
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
