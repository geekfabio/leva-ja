import { Text, View } from "react-native";
import { router } from "expo-router";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { MockMap } from "@/components/provider/MockMap";
import { useRequestDraft } from "@/stores/useRequestDraft";
import { getService } from "@/domain/catalog";
export default function LocationScreen() {
  const draft = useRequestDraft();
  const cargo = getService(draft.service).transport;
  const needsDestination = cargo || draft.service === "tow";
  const valid =
    draft.address.trim().length >= 5 &&
    (!cargo || draft.destination.trim().length >= 5);
  return (
    <ScreenLayout
      title={cargo ? "De onde para onde?" : "Onde precisas de apoio?"}
      subtitle="Passo 4 de 6"
      action={
        <AppButton
          label="Rever pedido"
          disabled={!valid}
          onPress={() => router.push("/request/estimate")}
        />
      }
    >
      <MockMap
        label="Local de recolha"
        detail={draft.address || "Introduz a morada"}
      />
      <AppInput
        label={cargo ? "Morada de recolha" : "Local da assistência"}
        value={draft.address}
        onChangeText={(address) => draft.update({ address })}
        placeholder="Rua, bairro e ponto de referência"
      />
      {needsDestination ? (
        <View className="gap-3">
          <AppInput
            label={
              cargo ? "Morada de entrega" : "Destino do reboque (opcional)"
            }
            value={draft.destination}
            onChangeText={(destination) => draft.update({ destination })}
            placeholder="Morada completa do destino"
          />
          <AppButton
            label="Escolher um local sugerido"
            variant="ghost"
            onPress={() => router.push("/request/destination" as never)}
          />
        </View>
      ) : null}
      <Text className="text-sm leading-5 text-muted">
        Mapa ilustrativo. Confirma as moradas antes de continuar.
      </Text>
    </ScreenLayout>
  );
}
