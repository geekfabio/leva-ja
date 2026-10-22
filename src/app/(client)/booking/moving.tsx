import { View } from "react-native";
import { Image } from "expo-image";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Armchair, ArrowUpDown, Building2, LayoutGrid, MapPin, Users } from "lucide-react-native";
import { AppHeader, AppText, Card, ChoiceChip, SegmentedTabs, Stepper, TextField } from "@/components/kit";
import { BookingScaffold } from "@/components/service/BookingScaffold";
import { propertyOptions } from "@/features/booking/catalog";
import { movingSchema, type MovingForm } from "@/features/booking/schemas";
import { useBookingStep } from "@/features/booking/useBookingFlow";
import { illustrations } from "@/theme/images";
import { useBookingStore } from "@/stores/useBookingStore";
import { formatFloor } from "@/utils/format";
import { colors } from "@/theme/colors";

function FieldCard({ icon, title, subtitle, children }: { icon: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Card style={{ gap: 14 }}>
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        {icon}
        <View style={{ flex: 1 }}>
          <AppText variant="h3">{title}</AppText>
          {subtitle ? (
            <AppText variant="caption" color={colors.muted}>
              {subtitle}
            </AppText>
          ) : null}
        </View>
      </View>
      {children}
    </Card>
  );
}

/** 16 · Mudança: imóvel, divisões, mobília, ajudantes, pisos e elevador. */
export default function MovingStep() {
  const { position, next, kind } = useBookingStep("moving");
  const draft = useBookingStore((s) => s.draft);
  const house = kind === "house_move";
  const { control, handleSubmit } = useForm<MovingForm>({
    resolver: zodResolver(movingSchema),
    defaultValues: { ...(draft.moving as MovingForm), kind: house ? "house_move" : "small_move" },
  });
  const submit = handleSubmit(({ kind: _kind, ...values }) => {
    useBookingStore.getState().patchMoving(values);
    next();
  });
  const iconProps = { size: 26, color: colors.ink, strokeWidth: 1.8 };
  return (
    <BookingScaffold step={position} onContinue={submit} header={<AppHeader brand step={position} />}>
      <View style={{ flexDirection: "row", alignItems: "flex-end", marginTop: -6 }}>
        <View style={{ flex: 1, gap: 6, paddingBottom: 8 }}>
          <AppText variant="h1" accessibilityRole="header">
            Detalhes da mudança
          </AppText>
          <AppText variant="caption" color={colors.muted}>
            Diz-nos os detalhes para prepararmos o veículo e a equipa certa.
          </AppText>
        </View>
        <Image source={illustrations.movingTeam} style={{ width: 120, height: 120, borderRadius: 16 }} contentFit="cover" accessibilityLabel="" />
      </View>
      {house ? (
        <FieldCard icon={<Building2 {...iconProps} />} title="Tipo de imóvel">
          <Controller
            control={control}
            name="propertyType"
            render={({ field, fieldState }) => (
              <View style={{ gap: 8 }}>
                <View accessibilityRole="radiogroup" style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {propertyOptions.map((o) => (
                    <ChoiceChip key={o.value} label={o.label} selected={field.value === o.value} onPress={() => field.onChange(o.value)} />
                  ))}
                </View>
                {fieldState.error ? <AppText variant="caption" color={colors.danger}>{fieldState.error.message}</AppText> : null}
              </View>
            )}
          />
          <AppText variant="label" weight="bold">
            Divisões a mudar
          </AppText>
          <Controller control={control} name="rooms" render={({ field }) => <Stepper label="Divisões" value={field.value} onChange={field.onChange} min={1} max={10} />} />
        </FieldCard>
      ) : null}
      <FieldCard icon={<Armchair {...iconProps} />} title="Itens principais" subtitle="Mobília, electrodomésticos e caixas">
        <Controller
          control={control}
          name="items"
          render={({ field, fieldState }) => (
            <TextField placeholder="Sofá, cama e caixas" accessibilityLabel="Itens principais" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} maxLength={200} />
          )}
        />
      </FieldCard>
      <FieldCard icon={<Users {...iconProps} />} title="Ajudantes" subtitle="Para carregar, descarregar e montar">
        <Controller control={control} name="helpers" render={({ field }) => <Stepper label="Ajudantes" value={field.value} onChange={field.onChange} min={0} max={6} />} />
      </FieldCard>
      <FieldCard icon={<MapPin {...iconProps} />} title="Piso de recolha" subtitle={draft.origin?.label ?? "Morada de recolha"}>
        <Controller control={control} name="pickupFloor" render={({ field }) => <Stepper label="Piso de recolha" value={field.value} onChange={field.onChange} max={30} format={formatFloor} />} />
      </FieldCard>
      <FieldCard icon={<MapPin {...iconProps} />} title="Piso de entrega" subtitle={draft.destination?.label ?? "Morada de entrega"}>
        <Controller control={control} name="deliveryFloor" render={({ field }) => <Stepper label="Piso de entrega" value={field.value} onChange={field.onChange} max={30} format={formatFloor} />} />
      </FieldCard>
      <FieldCard icon={<ArrowUpDown {...iconProps} />} title="Há elevador?" subtitle="Sem elevador, as escadas aumentam o tempo e o valor.">
        <Controller
          control={control}
          name="elevator"
          render={({ field }) => (
            <SegmentedTabs
              variant="segmented"
              value={field.value ? "yes" : "no"}
              onChange={(v) => field.onChange(v === "yes")}
              options={[
                { value: "yes", label: "Sim" },
                { value: "no", label: "Não" },
              ]}
            />
          )}
        />
      </FieldCard>
      {house ? null : (
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <LayoutGrid size={16} color={colors.muted} />
          <AppText variant="caption" color={colors.muted}>
            Para casas completas escolhe «Mudança de casa».
          </AppText>
        </View>
      )}
    </BookingScaffold>
  );
}
