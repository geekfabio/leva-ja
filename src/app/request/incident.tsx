import { Text, View, Switch } from "react-native";
import { router } from "expo-router";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppCard } from "@/components/ui/AppCard";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { SelectionCard } from "@/components/ui/SelectionCard";
import { useRequestDraft, cargoDetailsValid } from "@/stores/useRequestDraft";
import { getService } from "@/domain/catalog";
export default function IncidentScreen() {
  const draft = useRequestDraft();
  const cargo = getService(draft.service).transport;
  return (
    <ScreenLayout
      title={cargo ? "Conta-nos sobre a carga" : "Conta-nos o que aconteceu"}
      subtitle="Passo 2 de 6"
      action={
        <AppButton
          label="Escolher transporte"
          disabled={!cargoDetailsValid(draft)}
          onPress={() => router.push("/request/vehicle")}
        />
      }
    >
      {cargo ? (
        <>
          <AppInput
            label={
              draft.service === "moving"
                ? "O que vais levar na mudança?"
                : "O que queres transportar?"
            }
            value={draft.cargoDescription}
            onChangeText={(cargoDescription) =>
              draft.update({ cargoDescription })
            }
            placeholder="Ex.: sofá, frigorífico e 12 caixas"
            multiline
            hint="Descreve os volumes e os objectos frágeis."
          />
          <AppInput
            label="Peso total aproximado (kg)"
            keyboardType="decimal-pad"
            value={draft.weightKg}
            onChangeText={(weightKg) => draft.update({ weightKg })}
            placeholder="Ex.: 250"
            hint="Uma estimativa ajuda o parceiro a confirmar a viatura adequada."
          />
          <AppInput
            label="Dimensões do maior volume"
            value={draft.dimensions}
            onChangeText={(dimensions) => draft.update({ dimensions })}
            placeholder="Ex.: 2 m × 90 cm × 80 cm"
          />
          <AppCard>
            <View className="flex-row items-center gap-3">
              <View className="flex-1">
                <Text className="font-bold text-ink dark:text-white">
                  Ajuda para carregar e descarregar
                </Text>
                <Text className="mt-2 text-sm leading-5 text-muted">
                  Pede apoio ao parceiro. Incluído na estimativa de
                  demonstração.
                </Text>
              </View>
              <Switch
                accessibilityLabel="Ajuda para carregar e descarregar"
                value={draft.helpers}
                onValueChange={(helpers) => draft.update({ helpers })}
                trackColor={{ true: "#34D186" }}
              />
            </View>
          </AppCard>
          <AppInput
            label="Acesso no local de recolha (opcional)"
            value={draft.pickupAccess}
            onChangeText={(pickupAccess) => draft.update({ pickupAccess })}
            placeholder="Ex.: 3.º andar, sem elevador"
          />
          <AppInput
            label="Acesso no destino (opcional)"
            value={draft.deliveryAccess}
            onChangeText={(deliveryAccess) => draft.update({ deliveryAccess })}
            placeholder="Ex.: rés-do-chão, estacionamento à porta"
          />
        </>
      ) : (
        <>
          <AppInput
            label="Viatura a assistir"
            value={draft.customerVehicle}
            onChangeText={(customerVehicle) =>
              draft.update({ customerVehicle })
            }
            placeholder="Marca, modelo e matrícula"
          />
          <Text className="font-semibold text-ink dark:text-white">
            Gravidade
          </Text>
          <View className="gap-2">
            {(["low", "medium", "high"] as const).map((level, index) => (
              <SelectionCard
                key={level}
                title={["Baixa", "Média", "Alta"][index]}
                icon={<Text className="font-bold text-brand">{index + 1}</Text>}
                selected={draft.severity === level}
                onPress={() => draft.update({ severity: level })}
              />
            ))}
          </View>
          <Text className="rounded-2xl bg-amber-50 p-4 text-sm leading-5 text-amber-900">
            Se estiveres numa zona de risco, afasta-te da via e procura um local
            seguro.
          </Text>
        </>
      )}
      <AppInput
        label="Informações adicionais (opcional)"
        value={draft.notes}
        onChangeText={(notes) => draft.update({ notes })}
        placeholder={
          cargo
            ? "Horário preferido, cuidados especiais…"
            : "Descreve o problema…"
        }
        multiline
      />
      <AppButton
        label={
          draft.evidence.length
            ? `Fotos de exemplo: ${draft.evidence.length}`
            : "Adicionar fotos de exemplo"
        }
        variant="ghost"
        onPress={() => router.push("/request/evidence" as never)}
      />
    </ScreenLayout>
  );
}
