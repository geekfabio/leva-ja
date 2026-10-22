import { View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CarFront, Palette, RectangleHorizontal } from "lucide-react-native";
import { AppText, Card, ScreenTitle, SelectField, SelectionCard, TextField } from "@/components/kit";
import { BookingScaffold } from "@/components/service/BookingScaffold";
import { carBrands, carColors, carModels } from "@/features/booking/catalog";
import { towVehicleSchema, type TowVehicleForm } from "@/features/booking/schemas";
import { useBookingStep } from "@/features/booking/useBookingFlow";
import { useBookingStore } from "@/stores/useBookingStore";
import { colors } from "@/theme/colors";

const asOptions = (list: string[]) => list.map((v) => ({ value: v, label: v }));

/** 14 · Reboque: dados da viatura. */
export default function VehicleStep() {
  const { position, next } = useBookingStep("vehicle");
  const tow = useBookingStore((s) => s.draft.tow);
  const { control, handleSubmit, watch, setValue } = useForm<TowVehicleForm>({
    resolver: zodResolver(towVehicleSchema),
    defaultValues: { brand: tow.brand ?? "", model: tow.model ?? "", plate: tow.plate ?? "", color: tow.color ?? "", canMove: tow.canMove ?? false },
  });
  const brand = watch("brand");
  const submit = handleSubmit((values) => {
    useBookingStore.getState().patchTow(towVehicleSchema.parse(values));
    next();
  });
  return (
    <BookingScaffold step={position} onContinue={submit}>
      <ScreenTitle title="Dados da viatura" subtitle="Indica os detalhes da tua viatura para agilizarmos o serviço de reboque." />
      <Card tone="soft" style={{ alignItems: "center", paddingVertical: 18 }}>
        <CarFront size={72} color={colors.ink} strokeWidth={1.4} />
      </Card>
      <Controller
        control={control}
        name="brand"
        render={({ field, fieldState }) => (
          <SelectField
            label="Marca"
            icon={<CarFront size={20} color={colors.muted} />}
            value={field.value}
            options={asOptions(carBrands)}
            onChange={(v) => {
              field.onChange(v);
              setValue("model", "");
            }}
            placeholder="Escolhe a marca"
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="model"
        render={({ field, fieldState }) => (
          <SelectField
            label="Modelo"
            icon={<CarFront size={20} color={colors.muted} />}
            value={field.value}
            options={asOptions(carModels[brand] ?? [])}
            onChange={field.onChange}
            placeholder={brand ? "Escolhe o modelo" : "Escolhe primeiro a marca"}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="plate"
        render={({ field, fieldState }) => (
          <TextField
            label="Matrícula"
            placeholder="LD-12-34-AB"
            icon={<RectangleHorizontal size={20} color={colors.muted} />}
            autoCapitalize="characters"
            maxLength={11}
            value={field.value}
            onChangeText={(t) => field.onChange(t.toUpperCase())}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="color"
        render={({ field, fieldState }) => (
          <SelectField label="Cor" icon={<Palette size={20} color={colors.muted} />} value={field.value} options={asOptions(carColors)} onChange={field.onChange} placeholder="Escolhe a cor" error={fieldState.error?.message} />
        )}
      />
      <Controller
        control={control}
        name="canMove"
        render={({ field }) => (
          <View style={{ gap: 10 }}>
            <AppText variant="label" weight="bold">
              A viatura consegue deslocar-se?
            </AppText>
            <View accessibilityRole="radiogroup" style={{ flexDirection: "row", gap: 10 }}>
              <SelectionCard title="Sim" selected={field.value === true} onPress={() => field.onChange(true)} style={{ flex: 1 }} />
              <SelectionCard title="Não" selected={field.value === false} onPress={() => field.onChange(false)} style={{ flex: 1 }} />
            </View>
          </View>
        )}
      />
    </BookingScaffold>
  );
}
