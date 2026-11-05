import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react-native";
import { AppHeader, AppText, PrimaryButton, ScreenContainer, SelectField, TextButton, TextField } from "@/components/kit";
import { applicationVehicleSchema, vehicleClassOptions, type ApplicationVehicleForm } from "@/features/provider/applicationSchemas";
import { useApplicationStore } from "@/stores/useApplicationStore";
import { go } from "@/features/navigation";
import { colors } from "@/theme/colors";

/** Candidatura a prestador (passo 3 de 3, opcional): dados da viatura. */
export default function ApplyVehicleScreen() {
  const [hasVehicle, setHasVehicle] = useState(true);
  const { control, handleSubmit } = useForm<ApplicationVehicleForm>({
    resolver: zodResolver(applicationVehicleSchema),
    defaultValues: { brand: "", model: "", plate: "", color: "", class: "pickup", categoryLabel: "" },
  });
  const submit = handleSubmit((values) => {
    useApplicationStore.getState().setVehicle({ ...values, capacityKg: values.capacityKg ?? null });
    go("/apply-sent");
  });
  const skip = () => {
    useApplicationStore.getState().setVehicle(null);
    go("/apply-sent");
  };
  return (
    <ScreenContainer header={<AppHeader title="Candidatura" step={{ current: 3, total: 3 }} />} gap={20}>
      <AppText variant="display" accessibilityRole="header">
        A tua viatura
      </AppText>
      <AppText variant="body" color={colors.muted}>
        Partilha os dados da viatura que vais usar. Podes saltar este passo e indicar depois.
      </AppText>
      {hasVehicle ? (
        <>
          <Controller control={control} name="brand" render={({ field, fieldState }) => <TextField label="Marca" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />} />
          <Controller control={control} name="model" render={({ field, fieldState }) => <TextField label="Modelo" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />} />
          <Controller control={control} name="color" render={({ field, fieldState }) => <TextField label="Cor" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />} />
          <Controller control={control} name="plate" render={({ field, fieldState }) => <TextField label="Matrícula" autoCapitalize="characters" value={field.value} onChangeText={(t) => field.onChange(t.toUpperCase())} onBlur={field.onBlur} error={fieldState.error?.message} />} />
          <Controller
            control={control}
            name="class"
            render={({ field, fieldState }) => (
              <SelectField label="Tipo de viatura" value={field.value} options={vehicleClassOptions.map((o) => ({ value: o.value, label: o.label }))} onChange={field.onChange} error={fieldState.error?.message} />
            )}
          />
          <Controller control={control} name="categoryLabel" render={({ field, fieldState }) => <TextField label="Categoria (ex.: Pickup aberta)" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />} />
          <Controller
            control={control}
            name="capacityKg"
            render={({ field, fieldState }) => (
              <TextField label="Capacidade (kg, opcional)" keyboardType="number-pad" value={field.value ? String(field.value) : ""} onChangeText={(t) => field.onChange(t ? Number(t.replace(/\D/g, "")) : undefined)} error={fieldState.error?.message} />
            )}
          />
          <Controller
            control={control}
            name="year"
            render={({ field, fieldState }) => (
              <TextField label="Ano (opcional)" keyboardType="number-pad" value={field.value ? String(field.value) : ""} onChangeText={(t) => field.onChange(t ? Number(t.replace(/\D/g, "")) : undefined)} error={fieldState.error?.message} />
            )}
          />
          <PrimaryButton label="Continuar" onPress={submit} trailingIcon={<ArrowRight size={22} color={colors.white} />} />
          <TextButton size="sm" label="Não tenho viatura própria agora" onPress={() => setHasVehicle(false)} />
        </>
      ) : (
        <>
          <AppText variant="body" color={colors.muted}>
            Sem problema. Podes indicar a viatura mais tarde, já com a conta aprovada.
          </AppText>
          <PrimaryButton label="Enviar candidatura" onPress={skip} trailingIcon={<ArrowRight size={22} color={colors.white} />} />
          <TextButton size="sm" label="Afinal tenho viatura" onPress={() => setHasVehicle(true)} />
        </>
      )}
    </ScreenContainer>
  );
}
