import { Text, View } from "react-native";
import { router } from "expo-router";
import { AppButton } from "@/components/ui/AppButton";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { SelectionCard } from "@/components/ui/SelectionCard";
import { useRequestDraft } from "@/stores/useRequestDraft";
import { Camera } from "lucide-react-native";
export default function EvidenceScreen() {
  const { evidence, update } = useRequestDraft();
  const options = [
    "Vista geral",
    "Detalhe da carga ou problema",
    "Acesso ao local",
  ];
  return (
    <ScreenLayout
      title="Fotos de referência"
      subtitle="Anexos de demonstração"
      action={
        <AppButton label="Guardar e voltar" onPress={() => router.back()} />
      }
    >
      <Text className="text-base leading-6 text-muted">
        Selecciona os exemplos a associar ao pedido. Nesta demonstração não
        acedemos à câmara nem enviamos ficheiros.
      </Text>
      <View className="gap-3">
        {options.map((label) => (
          <SelectionCard
            role="checkbox"
            key={label}
            title={label}
            icon={<Camera size={23} color="#087F4F" />}
            selected={evidence.includes(label)}
            onPress={() =>
              update({
                evidence: evidence.includes(label)
                  ? evidence.filter((item) => item !== label)
                  : [...evidence, label],
              })
            }
          />
        ))}
      </View>
    </ScreenLayout>
  );
}
