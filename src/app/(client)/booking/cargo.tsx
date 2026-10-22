import { View } from "react-native";
import { Image } from "expo-image";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Package, PersonStanding } from "lucide-react-native";
import { AppText, Card, ChoiceChip, SelectField, SelectionCard, TextField, ToggleRow, VehicleImage } from "@/components/kit";
import { BookingScaffold } from "@/components/service/BookingScaffold";
import { cargoTypeOptions, cargoVehicleOptions, volumeOptions, weightOptions } from "@/features/booking/catalog";
import { cargoSchema, type CargoForm } from "@/features/booking/schemas";
import { useBookingStep } from "@/features/booking/useBookingFlow";
import { illustrations } from "@/theme/images";
import { useBookingStore } from "@/stores/useBookingStore";
import { colors } from "@/theme/colors";

function WeightIcon({ boxes }: { boxes: number }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", width: 40, gap: 1 }}>
      {Array.from({ length: boxes }, (_, i) => (
        <Package key={i} size={boxes > 2 ? 18 : 24} color={colors.ink} strokeWidth={1.6} />
      ))}
    </View>
  );
}

/** 15 · Carga: tipo, peso, volume, viatura (pickup) e ajudante. */
export default function CargoStep() {
  const { position, next } = useBookingStep("cargo");
  const draft = useBookingStore((s) => s.draft);
  const { control, handleSubmit, watch } = useForm<CargoForm>({
    resolver: zodResolver(cargoSchema),
    defaultValues: draft.cargo as CargoForm,
  });
  const cargoType = watch("cargoType");
  const submit = handleSubmit((values) => {
    useBookingStore.getState().patchCargo(values);
    next();
  });
  return (
    <BookingScaffold step={position} onContinue={submit}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View style={{ flex: 1, gap: 8 }}>
          <AppText variant="h1" accessibilityRole="header">
            {draft.variant === "goods" ? "O que vais entregar?" : "O que vais transportar?"}
          </AppText>
          <AppText variant="body" color={colors.text}>
            Diz-nos um pouco sobre a tua carga para te oferecermos a melhor opção em Luanda.
          </AppText>
        </View>
        <Image source={illustrations.cargoBoxes} style={{ width: 128, height: 128 }} contentFit="contain" accessibilityLabel="" />
      </View>
      <Card style={{ gap: 16 }}>
        <Controller
          control={control}
          name="cargoType"
          render={({ field }) => (
            <SelectField label="Tipo de carga" icon={<Package size={20} color={colors.ink} />} value={field.value} options={cargoTypeOptions} onChange={field.onChange} />
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field, fieldState }) => (
            <TextField
              label={cargoType === "other" ? "Descrição da carga" : "Descrição (opcional)"}
              placeholder="Ex.: sofá de 3 lugares e 6 caixas"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              maxLength={200}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="weight"
          render={({ field }) => (
            <View style={{ gap: 10 }}>
              <AppText variant="label" weight="bold">
                Peso estimado
              </AppText>
              <View accessibilityRole="radiogroup" style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {weightOptions.map((option) => (
                  <SelectionCard
                    key={option.value}
                    layout="tile"
                    indicator="radio"
                    title={option.label}
                    selected={field.value === option.value}
                    onPress={() => field.onChange(option.value)}
                    style={{ width: "47.8%", alignItems: "flex-start", minHeight: 92 }}
                    media={<WeightIcon boxes={option.boxes} />}
                  />
                ))}
              </View>
            </View>
          )}
        />
        <Controller
          control={control}
          name="volume"
          render={({ field }) => (
            <View style={{ gap: 10 }}>
              <AppText variant="label" weight="bold">
                Volume
              </AppText>
              <View accessibilityRole="radiogroup" style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                {volumeOptions.map((option) => (
                  <ChoiceChip key={option.value} label={`${option.label} · ${option.hint}`} selected={field.value === option.value} onPress={() => field.onChange(option.value)} />
                ))}
              </View>
            </View>
          )}
        />
        <Controller
          control={control}
          name="vehicleClass"
          render={({ field, fieldState }) => (
            <View style={{ gap: 10 }}>
              <AppText variant="label" weight="bold">
                Viatura
              </AppText>
              <View accessibilityRole="radiogroup" style={{ flexDirection: "row", gap: 8 }}>
                {cargoVehicleOptions.map((option) => (
                  <SelectionCard
                    key={option.value}
                    layout="tile"
                    indicator="none"
                    title={option.label}
                    description={option.hint}
                    selected={field.value === option.value}
                    onPress={() => field.onChange(option.value)}
                    style={{ flex: 1, paddingHorizontal: 6 }}
                    media={<VehicleImage art={option.art} width={84} height={52} label="" />}
                  />
                ))}
              </View>
              {fieldState.error ? (
                <AppText variant="caption" color={colors.danger} accessibilityRole="alert">
                  {fieldState.error.message}
                </AppText>
              ) : null}
            </View>
          )}
        />
      </Card>
      <Controller
        control={control}
        name="helper"
        render={({ field }) => (
          <ToggleRow
            icon={<PersonStanding size={30} color={colors.ink} />}
            title="Preciso de ajudante para carregar"
            description="O nosso ajudante pode ajudar a carregar e descarregar a tua carga."
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
    </BookingScaffold>
  );
}
