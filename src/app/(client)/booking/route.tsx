import { useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { ArrowLeft, ArrowRight, CirclePlus, LocateFixed, MapPin, X } from "lucide-react-native";
import { AppText, IconButton, MapPreview, PrimaryButton, SecondaryButton, StepProgress, type MapMarker } from "@/components/kit";
import { AddressPicker } from "@/components/service/AddressPicker";
import { routeSchema } from "@/features/booking/schemas";
import { useBookingStep } from "@/features/booking/useBookingFlow";
import { userLocation } from "@/mocks/places";
import { useBookingStore } from "@/stores/useBookingStore";
import type { Place } from "@/types/domain";
import { colors, radius } from "@/theme/colors";

type Target = "origin" | "destination" | "stop";

function PlaceField({ label, place, onPress, onClear, kind, error }: { label: string; place: Place | null; onPress: () => void; onClear: () => void; kind: "origin" | "destination" | "stop"; error?: string }) {
  return (
    <View style={{ gap: 4 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${place?.label ?? "por escolher"}`}
        accessibilityHint="Abre a pesquisa de moradas"
        onPress={onPress}
        style={({ pressed }) => ({
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          minHeight: 68,
          paddingHorizontal: 16,
          borderRadius: radius.md,
          borderWidth: error ? 1.5 : 1,
          borderColor: error ? colors.danger : colors.border,
          backgroundColor: pressed ? colors.primarySoft : colors.card,
        })}
      >
        {kind === "destination" ? <MapPin size={24} color={colors.white} fill={colors.accent} /> : <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 5, borderColor: colors.accent }} />}
        <View style={{ flex: 1 }}>
          <AppText variant="caption" color={colors.muted}>
            {label}
          </AppText>
          <AppText variant="title" weight="semibold" color={place ? colors.ink : colors.subtle}>
            {place?.label ?? "Escolher morada"}
          </AppText>
        </View>
        {place ? (
          <Pressable accessibilityRole="button" accessibilityLabel={`Limpar ${label}`} hitSlop={10} onPress={onClear}>
            <X size={22} color={colors.text} />
          </Pressable>
        ) : null}
      </Pressable>
      {error ? (
        <AppText variant="caption" color={colors.danger} accessibilityRole="alert">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

/** 19 · Trajecto: recolha, destino e paragens no mapa (mock). */
export default function RouteStep() {
  const { position, next } = useBookingStep("route");
  const { origin, destination, stops } = useBookingStore((s) => s.draft);
  const patch = useBookingStore((s) => s.patch);
  const picker = useRef<BottomSheetModal>(null);
  const [target, setTarget] = useState<Target>("origin");
  const [errors, setErrors] = useState<{ origin?: string; destination?: string }>({});

  const open = (t: Target) => {
    setTarget(t);
    picker.current?.present();
  };
  const onPick = (place: Place) => {
    if (target === "origin") patch({ origin: place });
    else if (target === "destination") patch({ destination: place });
    else patch({ stops: [...stops, place] });
    setErrors({});
    picker.current?.dismiss();
  };
  const submit = () => {
    const result = routeSchema.safeParse({ origin, destination, stops });
    if (!result.success) {
      const e: typeof errors = {};
      result.error.issues.forEach((i) => (e[i.path[0] as "origin" | "destination"] = i.message));
      return setErrors(e);
    }
    next();
  };
  const markers: MapMarker[] = [
    ...(origin ? [{ id: "o", kind: "origin" as const, coords: origin.coords, label: origin.area }] : []),
    ...stops.map((s, i) => ({ id: `s${i}`, kind: "stop" as const, coords: s.coords, label: s.area })),
    ...(destination ? [{ id: "d", kind: "destination" as const, coords: destination.coords, label: destination.area }] : []),
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, minHeight: 240 }}>
        <MapPreview height="100%" markers={markers} route={origin && destination ? { from: origin.coords, to: destination.coords } : undefined} />
        <SafeAreaView edges={["top"]} style={{ position: "absolute", left: 16, right: 16, top: 4, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <IconButton variant="floating" label="Voltar" icon={<ArrowLeft size={22} color={colors.ink} />} onPress={() => router.back()} />
          <View style={{ backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 }}>
            <StepProgress current={position.current} total={position.total} />
          </View>
          <IconButton variant="floating" label="Usar a minha localização como recolha" icon={<LocateFixed size={22} color={colors.ink} />} onPress={() => patch({ origin: userLocation })} />
        </SafeAreaView>
      </View>
      <SafeAreaView edges={["bottom"]} style={{ backgroundColor: colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -28, paddingHorizontal: 20, paddingTop: 10, gap: 12 }}>
        <View style={{ alignSelf: "center", width: 44, height: 5, borderRadius: 3, backgroundColor: colors.borderStrong }} />
        <AppText variant="h2" accessibilityRole="header">
          Trajecto do serviço
        </AppText>
        <PlaceField kind="origin" label="Local de recolha" place={origin} onPress={() => open("origin")} onClear={() => patch({ origin: null })} error={errors.origin} />
        {stops.map((stop, i) => (
          <PlaceField key={`${stop.id}-${i}`} kind="stop" label={`Paragem ${i + 1}`} place={stop} onPress={() => undefined} onClear={() => patch({ stops: stops.filter((_, j) => j !== i) })} />
        ))}
        <PlaceField kind="destination" label="Destino" place={destination} onPress={() => open("destination")} onClear={() => patch({ destination: null })} error={errors.destination} />
        {stops.length < 2 ? <SecondaryButton size="md" label="Adicionar paragem" icon={<CirclePlus size={22} color={colors.primary} />} onPress={() => open("stop")} /> : null}
        <View style={{ paddingBottom: 12 }}>
          <PrimaryButton label="Continuar" onPress={submit} trailingIcon={<ArrowRight size={22} color={colors.white} />} />
        </View>
      </SafeAreaView>
      <AddressPicker ref={picker} title={target === "origin" ? "Local de recolha" : target === "destination" ? "Destino" : "Adicionar paragem"} onPick={onPick} />
    </View>
  );
}
