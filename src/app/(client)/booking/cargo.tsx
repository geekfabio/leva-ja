import { useState } from "react";
import { AccessibilityInfo, View } from "react-native";
import { Image } from "expo-image";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Package, PersonStanding, Sparkles } from "lucide-react-native";
import { Appear, AppText, Card, ChoiceChip, SelectField, SelectionCard, TextField, ToggleRow } from "@/components/kit";
import { BookingScaffold } from "@/components/service/BookingScaffold";
import { VehiclePicker } from "@/components/service/VehiclePicker";
import { cargoTypeOptions, cargoVehicleOptions, goodsVehicleOptions, suggestVehicle, volumeOptions, weightOptions } from "@/features/booking/catalog";
import type { VolumeSize, WeightRange } from "@/types/domain";
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

/**
 * 15 · Carga: tipo, peso, volume, viatura e ajudante. Escolher o peso ou o
 * volume selecciona a viatura adequada (`suggestVehicle`; na entrega de
 * mercadoria, tuk-tuk para cargas pequenas); o utilizador pode trocá-la depois.
 */
export default function CargoStep() {
  const { position, next } = useBookingStep("cargo");
  const draft = useBookingStore((s) => s.draft);
  const { control, handleSubmit, watch, setValue, getValues } = useForm<CargoForm>({
    resolver: zodResolver(cargoSchema),
    defaultValues: draft.cargo as CargoForm,
  });
  const cargoType = watch("cargoType");
  const vehicleOptions = draft.variant === "goods" ? goodsVehicleOptions : cargoVehicleOptions;
  /** Última viatura sugerida e porquê (para explicar a escolha). */
  const [suggestion, setSuggestion] = useState<{ vehicle: string; reason: string } | null>(null);
  const suggest = (weight: WeightRange, volume: VolumeSize) => {
    const vehicle = suggestVehicle(draft.variant, weight, volume);
    setValue("vehicleClass", vehicle, { shouldValidate: true, shouldDirty: true });
    const weightLabel = weightOptions.find((o) => o.value === weight)?.label.toLowerCase();
    setSuggestion({ vehicle, reason: vehicle === "tuk_tuk" ? `${weightLabel} e volume pequeno` : `${weightLabel}` });
    const label = vehicleOptions.find((o) => o.value === vehicle)?.label;
    AccessibilityInfo.announceForAccessibility?.(`Viatura sugerida: ${label}`);
  };
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
                    onPress={() => {
                      field.onChange(option.value);
                      suggest(option.value, getValues("volume"));
                    }}
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
                  <ChoiceChip
                    key={option.value}
                    label={`${option.label} · ${option.hint}`}
                    selected={field.value === option.value}
                    onPress={() => {
                      field.onChange(option.value);
                      suggest(getValues("weight"), option.value);
                    }}
                  />
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
              <VehiclePicker
                options={vehicleOptions}
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  setSuggestion(null);
                }}
              />
              {suggestion && suggestion.vehicle === field.value ? (
                <Appear key={`${suggestion.vehicle}-${suggestion.reason}`} from="fade">
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Sparkles size={16} color={colors.primary} />
                    <AppText variant="caption" color={colors.primary} weight="semibold" style={{ flex: 1 }}>
                      Sugerimos {vehicleOptions.find((o) => o.value === field.value)?.label.toLowerCase()} para {suggestion.reason}. Podes trocar.
                    </AppText>
                  </View>
                </Appear>
              ) : null}
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
