import { useMemo } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CalendarDays, Clock3, Info, Wrench, Zap } from "lucide-react-native";
import { router } from "expo-router";
import { AppText, BrandLogo, IconButton, IconCircle, InfoNote, SelectField, SelectionCard, ToggleRow } from "@/components/kit";
import { BookingScaffold } from "@/components/service/BookingScaffold";
import { scheduleSchema, type ScheduleForm } from "@/features/booking/schemas";
import { useBookingStep } from "@/features/booking/useBookingFlow";
import { illustrations } from "@/mocks/assets";
import { useBookingStore } from "@/stores/useBookingStore";
import { formatWeekdayDate } from "@/utils/date";
import { colors } from "@/theme/colors";

const timeSlots = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

/** 17 · Mudança: quando precisas do serviço e desmontagem. */
export default function ScheduleStep() {
  const { next, position } = useBookingStep("schedule");
  const moving = useBookingStore((s) => s.draft.moving);
  const dates = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i + 1);
        d.setHours(10, 0, 0, 0);
        return { value: d.toISOString(), label: formatWeekdayDate(d.toISOString()) };
      }),
    [],
  );
  const { control, handleSubmit, watch } = useForm<ScheduleForm>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: { when: moving.when ?? "now", date: moving.date ?? dates[2]!.value, time: moving.time ?? "10:00", disassembly: moving.disassembly ?? false },
  });
  const when = watch("when");
  const submit = handleSubmit((values) => {
    const date = values.when === "scheduled" && values.date ? new Date(values.date) : undefined;
    if (date && values.time) date.setHours(Number(values.time.slice(0, 2)), Number(values.time.slice(3)), 0, 0);
    useBookingStore.getState().patchMoving({ ...values, date: date?.toISOString() });
    next();
  });

  const hero = (
    <View>
      <Image source={illustrations.movingHouse} style={{ position: "absolute", right: 0, top: 0, width: "62%", height: 260 }} contentFit="cover" accessibilityLabel="" />
      <LinearGradient
        colors={[colors.background, colors.background, "rgba(248,249,247,0.75)", "rgba(248,249,247,0)"]}
        locations={[0, 0.38, 0.55, 0.8]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ position: "absolute", left: 0, top: 0, right: 0, height: 260 }}
      />
      <SafeAreaView edges={["top"]} style={{ paddingHorizontal: 12, height: 260 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <IconButton label="Voltar" icon={<ArrowLeft size={24} color={colors.ink} />} onPress={() => router.back()} />
          <AppText variant="label" style={{ backgroundColor: "rgba(255,255,255,0.85)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 }}>
            {position.current} de {position.total}
          </AppText>
        </View>
        <View style={{ paddingHorizontal: 8, gap: 6, maxWidth: "58%" }}>
          <BrandLogo size="sm" tagline={false} />
          <AppText variant="h1" accessibilityRole="header">
            Organiza a tua mudança
          </AppText>
          <AppText variant="caption" color={colors.text}>
            Nós tratamos do resto. Pessoas de confiança, veículos adequados e cuidado com os teus bens.
          </AppText>
        </View>
      </SafeAreaView>
    </View>
  );

  return (
    <BookingScaffold header={hero} onContinue={submit}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 6 }}>
        <IconCircle size={48}>
          <CalendarDays size={24} color={colors.primary} />
        </IconCircle>
        <AppText variant="h3">Quando precisas do serviço?</AppText>
      </View>
      <Controller
        control={control}
        name="when"
        render={({ field }) => (
          <View accessibilityRole="radiogroup" style={{ flexDirection: "row", gap: 10 }}>
            <SelectionCard layout="tile" indicator="radio" title="Hoje" description="Mais rápido, sempre que precisares." selected={field.value === "now"} onPress={() => field.onChange("now")} style={{ flex: 1, alignItems: "flex-start" }} media={<Zap size={26} color={colors.ink} />} />
            <SelectionCard layout="tile" indicator="radio" title="Agendar" description="Escolhe a data e hora que te convém." selected={field.value === "scheduled"} onPress={() => field.onChange("scheduled")} style={{ flex: 1, alignItems: "flex-start" }} media={<CalendarDays size={26} color={colors.ink} />} />
          </View>
        )}
      />
      {when === "scheduled" ? (
        <View style={{ gap: 10 }}>
          <AppText variant="label" weight="bold">
            Data e hora
          </AppText>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1.4 }}>
              <Controller control={control} name="date" render={({ field, fieldState }) => <SelectField icon={<CalendarDays size={20} color={colors.ink} />} placeholder="Data" value={field.value} options={dates} onChange={field.onChange} error={fieldState.error?.message} />} />
            </View>
            <View style={{ flex: 1 }}>
              <Controller control={control} name="time" render={({ field, fieldState }) => <SelectField icon={<Clock3 size={20} color={colors.ink} />} placeholder="Hora" value={field.value} options={timeSlots.map((t) => ({ value: t, label: t }))} onChange={field.onChange} error={fieldState.error?.message} />} />
            </View>
          </View>
        </View>
      ) : null}
      <Controller
        control={control}
        name="disassembly"
        render={({ field }) => (
          <ToggleRow tone="soft" icon={<Wrench size={28} color={colors.primary} />} title="Preciso de desmontagem e montagem" description="A nossa equipa desmonta e monta os teus móveis no destino." value={field.value} onChange={field.onChange} />
        )}
      />
      <InfoNote icon={<Info size={22} color={colors.muted} />}>Inclui ferramentas, protecção dos móveis e montagem no novo endereço.</InfoNote>
    </BookingScaffold>
  );
}
