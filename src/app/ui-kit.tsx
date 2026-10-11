import { useState } from "react";
import { Redirect } from "expo-router";
import { Text, View } from "react-native";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppCard } from "@/components/ui/AppCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { VehicleCard } from "@/components/transport/VehicleCard";
import { vehicles, VehicleId } from "@/domain/catalog";
export default function ComponentGallery() {
  const [vehicle, setVehicle] = useState<VehicleId>("pickup");
  if (!__DEV__) return <Redirect href="/" />;
  return (
    <ScreenLayout
      title="Catálogo de componentes"
      subtitle="Desenvolvimento · Leva Já"
    >
      <AppCard>
        <Text className="mb-4 text-xl font-bold text-ink dark:text-white">
          Acções e estados
        </Text>
        <View className="gap-3">
          <AppButton label="Acção principal" />
          <AppButton label="Acção secundária" variant="ghost" />
          <AppButton label="Acção destrutiva" variant="danger" />
          <AppButton label="Indisponível" disabled />
          <AppButton label="A carregar" loading />
        </View>
      </AppCard>
      <AppInput label="Campo normal" placeholder="Escreve aqui" />
      <AppInput
        label="Campo com erro"
        error="Confirma o valor introduzido."
        defaultValue="Valor inválido"
      />
      <AppInput
        label="Campo desactivado"
        editable={false}
        value="A confirmar"
      />
      <View className="flex-row flex-wrap gap-2">
        {["Confirmado", "Pendente", "Falhou", "Cancelado", "A caminho"].map(
          (status) => (
            <StatusBadge key={status} status={status} />
          ),
        )}
      </View>
      <Text className="text-xl font-bold text-ink dark:text-white">
        Frota 3D
      </Text>
      {(Object.keys(vehicles) as VehicleId[]).map((id) => (
        <VehicleCard
          key={id}
          vehicle={id}
          selected={id === vehicle}
          onPress={() => setVehicle(id)}
        />
      ))}
    </ScreenLayout>
  );
}
