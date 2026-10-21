import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { AuthScaffold } from "@/components/ui/AuthScaffold";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { useRequestDraft } from "@/stores/useRequestDraft";

export default function AddressScreen() {
  const [address, setAddress] = useState("");
  const update = useRequestDraft((state) => state.update);
  const valid = address.trim().length >= 5;
  return (
    <AuthScaffold
      title="Onde podemos ajudar?"
      description="Adiciona uma morada de referência. Podes alterá-la ao pedir um serviço."
    >
      <AppCard>
        <AppInput
          label="Morada principal"
          value={address}
          onChangeText={setAddress}
          placeholder="Ex.: Rua da Missão, Ingombota"
          multiline
          hint="Inclui a rua, zona ou um ponto de referência."
        />
      </AppCard>
      <View className="mt-6">
        <AppButton
          label="Guardar e continuar"
          disabled={!valid}
          onPress={() => {
            update({ address: address.trim() });
            router.replace("/legacy");
          }}
        />
      </View>
    </AuthScaffold>
  );
}
