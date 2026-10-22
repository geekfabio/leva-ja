import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { ArrowLeft, ArrowRight, CirclePlus, Clock3, LocateFixed, MapPin, Route, X } from "lucide-react-native";
import { AppText, ChoiceChip, IconButton, MapPreview, PrimaryButton, SecondaryButton, StepProgress, type MapMarker } from "@/components/kit";
import { AddressPicker } from "@/components/service/AddressPicker";
import { routeSchema } from "@/features/booking/schemas";
import { useBookingStep } from "@/features/booking/useBookingFlow";
import { useAreas, useCurrentLocation } from "@/services/queries";
import { useDrivingRoute } from "@/services/routing";
import { useBookingStore } from "@/stores/useBookingStore";
import type { Coordinates, Place } from "@/types/domain";
import { formatDuration, formatKm } from "@/utils/format";
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

/** 19 · Trajecto: recolha, destino e paragens sobre OpenStreetMap. */
export default function RouteStep() {
  const { position, next } = useBookingStep("route");
  const { origin, destination, stops, routePlan } = useBookingStore((s) => s.draft);
  const patch = useBookingStore((s) => s.patch);
  const picker = useRef<BottomSheetModal>(null);
  const [target, setTarget] = useState<Target>("origin");
  const [errors, setErrors] = useState<{ origin?: string; destination?: string }>({});
  const { data: current, refetch: refreshLocation, isFetching: locating } = useCurrentLocation();
  const { data: areas = [] } = useAreas();
  const routePoints = useMemo(
    () => (origin && destination ? [origin.coords, ...stops.map((stop) => stop.coords), destination.coords] : []),
    [origin, destination, stops],
  );
  const calculatedRoute = useDrivingRoute(routePoints, routePoints.length >= 2);
  // Recolha por omissão: a posição actual devolvida pelo LocationRepository.
  useEffect(() => {
    if (current && !useBookingStore.getState().draft.origin) {
      patch({ origin: current, routePlan: null });
      setTarget("destination");
    }
  }, [current, patch]);

  useEffect(() => {
    if (calculatedRoute.data) patch({ routePlan: calculatedRoute.data });
  }, [calculatedRoute.data, patch]);

  const open = (t: Target) => {
    setTarget(t);
    picker.current?.present();
  };
  const onPick = (place: Place) => {
    if (target === "origin") patch({ origin: place, routePlan: null });
    else if (target === "destination") patch({ destination: place, routePlan: null });
    else patch({ stops: [...stops, place], routePlan: null });
    setErrors({});
    picker.current?.dismiss();
  };
  const placeAt = (coords: Coordinates): Place => {
    const nearest = areas.reduce<Place | undefined>((best, place) => {
      if (!best) return place;
      const distance = (candidate: Place) => (candidate.coords.latitude - coords.latitude) ** 2 + (candidate.coords.longitude - coords.longitude) ** 2;
      return distance(place) < distance(best) ? place : best;
    }, undefined);
    const area = nearest?.area ?? "Angola";
    return {
      id: `map-${coords.latitude.toFixed(5)}-${coords.longitude.toFixed(5)}`,
      label: `Ponto no mapa · ${area}`,
      area,
      city: "Angola",
      coords,
    };
  };
  const selectOnMap = (coords: Coordinates) => {
    const place = placeAt(coords);
    if (target === "origin") {
      patch({ origin: place, routePlan: null });
      setTarget("destination");
    } else if (target === "destination") patch({ destination: place, routePlan: null });
    else patch({ stops: [...stops, place], routePlan: null });
    setErrors({});
  };
  const useGps = async () => {
    const result = await refreshLocation();
    if (result.data) {
      patch({ origin: result.data, routePlan: null });
      setTarget("destination");
    }
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
        <MapPreview
          height="100%"
          markers={markers}
          route={origin && destination ? { from: origin.coords, via: stops.map((stop) => stop.coords), to: destination.coords, coordinates: routePlan?.coordinates } : undefined}
          onMapPress={selectOnMap}
          accessibilityLabel="Mapa OpenStreetMap para escolher recolha e destino"
        />
        <SafeAreaView edges={["top"]} style={{ position: "absolute", left: 16, right: 16, top: 4, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <IconButton variant="floating" label="Voltar" icon={<ArrowLeft size={22} color={colors.ink} />} onPress={() => router.back()} />
          <View style={{ backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 }}>
            <StepProgress current={position.current} total={position.total} />
          </View>
          <IconButton variant="floating" label="Usar a minha localização como recolha" icon={locating ? <ActivityIndicator size="small" color={colors.ink} /> : <LocateFixed size={22} color={colors.ink} />} onPress={useGps} />
        </SafeAreaView>
        <View pointerEvents="none" style={{ position: "absolute", bottom: 34, alignSelf: "center", backgroundColor: "rgba(5,52,32,0.92)", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 18 }}>
          <AppText variant="caption" weight="semibold" color={colors.white}>Toque no mapa para marcar {target === "origin" ? "a recolha" : target === "destination" ? "o destino" : "a paragem"}</AppText>
        </View>
      </View>
      <SafeAreaView edges={["bottom"]} style={{ backgroundColor: colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -28, paddingHorizontal: 20, paddingTop: 10, gap: 12 }}>
        <View style={{ alignSelf: "center", width: 44, height: 5, borderRadius: 3, backgroundColor: colors.borderStrong }} />
        <AppText variant="h2" accessibilityRole="header">
          Trajecto do serviço
        </AppText>
        <View style={{ flexDirection: "row", gap: 8 }} accessibilityRole="radiogroup">
          <ChoiceChip label="Marcar recolha" selected={target === "origin"} onPress={() => setTarget("origin")} icon={<LocateFixed size={17} color={target === "origin" ? colors.primary : colors.text} />} />
          <ChoiceChip label="Marcar destino" selected={target === "destination"} onPress={() => setTarget("destination")} icon={<MapPin size={17} color={target === "destination" ? colors.primary : colors.text} />} />
        </View>
        {routePlan ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14, borderRadius: radius.md, backgroundColor: colors.primarySoft, paddingHorizontal: 14, paddingVertical: 10 }}>
            <Route size={20} color={colors.primary} />
            <AppText variant="title" color={colors.primary}>{formatKm(routePlan.distanceKm)}</AppText>
            <Clock3 size={20} color={colors.primary} />
            <AppText variant="title" color={colors.primary}>{formatDuration(routePlan.durationMin)}</AppText>
            {calculatedRoute.isFetching ? <ActivityIndicator size="small" color={colors.primary} /> : null}
          </View>
        ) : null}
        <PlaceField kind="origin" label="Local de recolha" place={origin} onPress={() => open("origin")} onClear={() => patch({ origin: null, routePlan: null })} error={errors.origin} />
        {stops.map((stop, i) => (
          <PlaceField key={`${stop.id}-${i}`} kind="stop" label={`Paragem ${i + 1}`} place={stop} onPress={() => undefined} onClear={() => patch({ stops: stops.filter((_, j) => j !== i), routePlan: null })} />
        ))}
        <PlaceField kind="destination" label="Destino" place={destination} onPress={() => open("destination")} onClear={() => patch({ destination: null, routePlan: null })} error={errors.destination} />
        {stops.length < 2 ? <SecondaryButton size="md" label="Adicionar paragem" icon={<CirclePlus size={22} color={colors.primary} />} onPress={() => open("stop")} /> : null}
        <View style={{ paddingBottom: 12 }}>
          <PrimaryButton label="Continuar" onPress={submit} trailingIcon={<ArrowRight size={22} color={colors.white} />} />
        </View>
      </SafeAreaView>
      <AddressPicker ref={picker} title={target === "origin" ? "Local de recolha" : target === "destination" ? "Destino" : "Adicionar paragem"} onPick={onPick} />
    </View>
  );
}
