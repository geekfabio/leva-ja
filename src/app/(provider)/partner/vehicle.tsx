import { useRef, useState } from "react";
import { View } from "react-native";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeCheck, Calendar, Car, CircleCheck, ImagePlus, Package, Pencil, Settings2, Weight } from "lucide-react-native";
import { AppHeader, AppText, Avatar, Card, Divider, PhotoTile, PrimaryButton, ScreenContainer, SecondaryButton, ServiceIcon, SheetModal, TextField } from "@/components/kit";
import { serviceShortTitle } from "@/features/booking/catalog";
import { vehicleSchema, type VehicleForm } from "@/features/provider/schemas";
import { avatarFor, currentProvider } from "@/mocks/people";
import { useProviderStore } from "@/stores/useProviderStore";
import { formatNumber } from "@/utils/format";
import { toast } from "@/lib/toast";
import { colors, radius } from "@/theme/colors";

/** 42 · A minha viatura: detalhes, serviços aceites e edição. */
export default function VehicleScreen() {
  const vehicle = useProviderStore((s) => s.vehicle);
  const services = useProviderStore((s) => s.services);
  const [photos, setPhotos] = useState(1);
  const edit = useRef<BottomSheetModal>(null);
  const { control, handleSubmit, reset } = useForm<VehicleForm>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: { brand: vehicle.brand, model: vehicle.model, plate: vehicle.plate, capacityKg: vehicle.capacityKg },
  });
  const save = handleSubmit((values) => {
    useProviderStore.getState().updateVehicle(values);
    edit.current?.dismiss();
    toast.success({ title: "Viatura actualizada", message: "A alteração fica sujeita a validação (simulada)." });
  });
  const rows: [React.ReactNode, string, string][] = [
    [<Settings2 key="a" size={18} color={colors.muted} />, "Marca e modelo", `${vehicle.brand} ${vehicle.model}`],
    [<Car key="b" size={18} color={colors.muted} />, "Matrícula", vehicle.plate],
    [<Package key="c" size={18} color={colors.muted} />, "Categoria", vehicle.categoryLabel],
    [<Weight key="d" size={18} color={colors.muted} />, "Capacidade de carga", `Até ${formatNumber(vehicle.capacityKg)} kg`],
    [<Calendar key="e" size={18} color={colors.muted} />, "Ano", String(vehicle.year)],
  ];
  return (
    <ScreenContainer header={<AppHeader title="A minha viatura" />} gap={14}>
      <Card tone="soft" style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Avatar name={currentProvider.name} initials={currentProvider.initials} photo={avatarFor[currentProvider.id]} size={48} />
        <View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <AppText variant="title">{currentProvider.name}</AppText>
            <BadgeCheck size={16} color={colors.white} fill={colors.accent} />
          </View>
          <AppText variant="caption" color={colors.muted}>
            Prestador verificado
          </AppText>
        </View>
      </Card>
      <Card padding={0} style={{ overflow: "hidden" }}>
        <PhotoTile photo={{ id: "car", asset: "hilux-street", caption: `${vehicle.brand} ${vehicle.model}` }} size="flex" aspect={1.7} rounded={0} />
        <View style={{ padding: 16, gap: 8 }}>
          <AppText variant="h1">
            {vehicle.brand} {vehicle.model}
          </AppText>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", backgroundColor: colors.primarySoft, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Car size={20} color={colors.ink} />
            <AppText variant="h3">{vehicle.plate}</AppText>
          </View>
          <AppText variant="body" color={colors.muted}>
            {vehicle.categoryLabel} · {photos} {photos === 1 ? "fotografia" : "fotografias"}
          </AppText>
          <Divider />
          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1 }}>
              <AppText variant="caption">Capacidade até</AppText>
              <AppText variant="title">{formatNumber(vehicle.capacityKg)} kg</AppText>
            </View>
            <Divider vertical />
            <View style={{ flex: 1, paddingLeft: 12 }}>
              <AppText variant="caption">Tipo de viatura</AppText>
              <AppText variant="title">{vehicle.categoryLabel}</AppText>
            </View>
          </View>
        </View>
      </Card>
      <Card style={{ gap: 10 }}>
        <AppText variant="title">Serviços aceites</AppText>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {services.map((k) => (
            <View key={k} style={{ flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: colors.primarySoft }}>
              <ServiceIcon kind={k} size={18} color={colors.ink} />
              <AppText variant="caption" weight="semibold">
                {serviceShortTitle[k]}
              </AppText>
              <CircleCheck size={16} color={colors.white} fill={colors.accent} />
            </View>
          ))}
        </View>
      </Card>
      <PrimaryButton label="Editar viatura" icon={<Pencil size={20} color={colors.white} />} onPress={() => { reset({ brand: vehicle.brand, model: vehicle.model, plate: vehicle.plate, capacityKg: vehicle.capacityKg }); edit.current?.present(); }} />
      <SecondaryButton label="Adicionar fotografias" icon={<ImagePlus size={20} color={colors.primary} />} onPress={() => { setPhotos((p) => p + 1); toast.success("Fotografia adicionada (simulada)"); }} />
      <Card style={{ gap: 10 }}>
        <AppText variant="title">Detalhes da viatura</AppText>
        {rows.map(([icon, label, value]) => (
          <View key={label} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {icon}
            <AppText variant="caption" color={colors.muted} style={{ flex: 1 }}>
              {label}
            </AppText>
            <AppText variant="caption" weight="semibold">
              {value}
            </AppText>
          </View>
        ))}
      </Card>
      <SheetModal ref={edit} title="Editar viatura">
        <Controller control={control} name="brand" render={({ field, fieldState }) => <TextField label="Marca" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />} />
        <Controller control={control} name="model" render={({ field, fieldState }) => <TextField label="Modelo" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />} />
        <Controller control={control} name="plate" render={({ field, fieldState }) => <TextField label="Matrícula" autoCapitalize="characters" value={field.value} onChangeText={(t) => field.onChange(t.toUpperCase())} error={fieldState.error?.message} />} />
        <Controller control={control} name="capacityKg" render={({ field, fieldState }) => <TextField label="Capacidade (kg)" keyboardType="number-pad" value={field.value ? String(field.value) : ""} onChangeText={(t) => field.onChange(Number(t.replace(/\D/g, "")) || 0)} error={fieldState.error?.message} />} />
        <PrimaryButton label="Guardar" onPress={save} />
      </SheetModal>
    </ScreenContainer>
  );
}
