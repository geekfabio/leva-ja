import { Text, View } from "react-native";
import { router } from "expo-router";
import { AppButton } from "@/components/ui/AppButton";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { VehicleCard } from "@/components/transport/VehicleCard";
import { useRequestDraft } from "@/stores/useRequestDraft";
import { getService } from "@/domain/catalog";
export default function VehicleScreen() {
  const draft = useRequestDraft();
  const service = getService(draft.service);
  return (
    <ScreenLayout
      title="Escolhe a tua viatura"
      subtitle="Passo 3 de 6"
      action={
        <AppButton
          label="Confirmar viatura"
          onPress={() => router.push("/request/location")}
        />
      }
    >
      <Text className="text-base leading-6 text-muted">
        {service.transport
          ? "Escolhe o transporte para a tua carga. O parceiro confirma a capacidade a partir dos detalhes que forneceste."
          : "Esta é a viatura que te vai apoiar."}
      </Text>
      <View accessibilityRole="radiogroup" className="gap-3">
        {service.vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle}
            vehicle={vehicle}
            selected={draft.vehicleType === vehicle}
            onPress={() => draft.update({ vehicleType: vehicle })}
          />
        ))}
      </View>
      <Text className="text-sm leading-6 text-muted">
        As imagens 3D representam categorias. O modelo exacto e a
        disponibilidade são confirmados pelo parceiro.
      </Text>
    </ScreenLayout>
  );
}
