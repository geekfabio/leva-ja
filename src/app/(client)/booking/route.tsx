import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { ArrowLeft, ArrowRight, CirclePlus, LocateFixed, MapPin, X } from "lucide-react-native";
import { AppText, IconButton, MapPreview, PrimaryButton, SecondaryButton, StepProgress, type MapMarker } from "@/components/kit";
import { AddressPicker } from "@/components/service/AddressPicker";
import { routeSchema } from "@/features/booking/schemas";
import { useBookingStep } from "@/features/booking/useBookingFlow";
import { placeFromCoordinates, useDeviceLocation } from "@/features/location/useDeviceLocation";
import { useDrivingRoute } from "@/services/routing";
import { useCurrentLocation } from "@/services/queries";
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
        accessibilityLabel={label + ": " + (place?.label ?? "por escolher")}
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
          <AppText variant="caption" color={colors.muted}>{label}</AppText>
          <AppText variant="title" weight="semibold" color={place ? colors.ink : colors.subtle}>{place?.label ?? "Escolher morada"}</AppText>
        </View>
        {place ? <Pressable accessibilityRole="button" accessibilityLabel={"Limpar " + label} hitSlop={10} onPress={onClear}><X size={22} color={colors.text} /></Pressable> : null}
      </Pressable>
      {error ? <AppText variant="caption" color={colors.danger} accessibilityRole="alert">{error}</AppText> : null}
    </View>
  );
}

/** 19 · Escolha de recolha e destino com GPS, toque no mapa e rota automóvel. */
export default function RouteStep() {
  const { position, next } = useBookingStep("route");
  const { origin, destination, stops } = useBookingStore((state) => state.draft);
  const patch = useBookingStore((state) => state.patch);
  const picker = useRef<BottomSheetModal>(null);
  const originWasSelectedManually = useRef(false);
  const [target, setTarget] = useState<Target>("origin");
  const [errors, setErrors] = useState<{ origin?: string; destination?: string }>({});
  const { data: mockCurrent } = useCurrentLocation();
  const { place: gpsPlace, isLoading: locating, error: gpsError, refresh } = useDeviceLocation();
  const drivingRoute = useDrivingRoute(origin?.coords, destination?.coords);

  useEffect(() => {
    if (!gpsPlace || originWasSelectedManually.current) return;
    patch({ origin: gpsPlace });
    setTarget("destination");
  }, [gpsPlace, patch]);

  useEffect(() => {
    if (!origin && !gpsPlace && mockCurrent && !originWasSelectedManually.current) patch({ origin: mockCurrent });
  }, [gpsPlace, mockCurrent, origin, patch]);

  const clearRoute = () => patch({ routeDistanceKm: undefined, routeDurationMin: undefined, routeGeometry: undefined });
  const choose = (place: Place) => {
    if (target === "origin") {
      originWasSelectedManually.current = true;
      patch({ origin: place });
      setTarget("destination");
    } else if (target === "destination") {
      patch({ destination: place });
    } else {
      patch({ stops: [...stops, place] });
    }
    clearRoute();
    setErrors({});
    picker.current?.dismiss();
  };
  const openPicker = (nextTarget: Target) => {
    setTarget(nextTarget);
    picker.current?.present();
  };
  const chooseOnMap = (coords: Coordinates) => {
    choose(placeFromCoordinates(coords, target === "origin" ? "Local de recolha no mapa" : target === "destination" ? "Destino no mapa" : "Paragem no mapa"));
  };
  const useGps = async () => {
    const place = await refresh();
    if (!place) return;
    originWasSelectedManually.current = false;
    patch({ origin: place });
    clearRoute();
    setTarget("destination");
  };
  const submit = () => {
    const result = routeSchema.safeParse({ origin, destination, stops });
    if (!result.success) {
      const nextErrors: typeof errors = {};
      result.error.issues.forEach((issue) => { nextErrors[issue.path[0] as "origin" | "destination"] = issue.message; });
      setErrors(nextErrors);
      return;
    }
    if (drivingRoute.data) {
      patch({
        routeDistanceKm: drivingRoute.data.distanceKm,
        routeDurationMin: drivingRoute.data.durationMin,
        routeGeometry: drivingRoute.data.coordinates,
      });
    }
    next();
  };

  const markers: MapMarker[] = [
    ...(origin ? [{ id: "o", kind: "origin" as const, coords: origin.coords, label: origin.area }] : []),
    ...stops.map((stop, index) => ({ id: "s" + index, kind: "stop" as const, coords: stop.coords, label: stop.area })),
    ...(destination ? [{ id: "d", kind: "destination" as const, coords: destination.coords, label: destination.area }] : []),
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, minHeight: 240 }}>
        <MapPreview
          height="100%"
          markers={markers}
          route={origin && destination ? { from: origin.coords, to: destination.coords, coordinates: drivingRoute.data?.coordinates } : undefined}
          onMapPress={chooseOnMap}
          showsUserLocation={Boolean(gpsPlace)}
          accessibilityLabel="Mapa de Angola. Amplie, mova e toque para definir a recolha ou o destino."
        />
        <SafeAreaView edges={["top"]} style={{ position: "absolute", left: 16, right: 16, top: 4, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <IconButton variant="floating" label="Voltar" icon={<ArrowLeft size={22} color={colors.ink} />} onPress={() => router.back()} />
          <View style={{ backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 }}><StepProgress current={position.current} total={position.total} /></View>
          <IconButton variant="floating" label={locating ? "A obter GPS" : "Usar GPS"} icon={locating ? <ActivityIndicator color={colors.ink} /> : <LocateFixed size={22} color={colors.ink} />} onPress={() => void useGps()} />
        </SafeAreaView>
      </View>
      <SafeAreaView edges={["bottom"]} style={{ backgroundColor: colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -28, paddingHorizontal: 20, paddingTop: 10, gap: 12 }}>
        <View style={{ alignSelf: "center", width: 44, height: 5, borderRadius: 3, backgroundColor: colors.borderStrong }} />
        <AppText variant="h2" accessibilityRole="header">Trajecto do serviço</AppText>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <AppText variant="label" color={colors.muted} style={{ flex: 1 }}>Toque no mapa para definir</AppText>
          {(["origin", "destination"] as const).map((option) => (
            <Pressable key={option} onPress={() => setTarget(option)} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: target === option ? colors.primary : colors.primarySoft }}>
              <AppText variant="tiny" weight="bold" color={target === option ? colors.white : colors.primary}>{option === "origin" ? "Recolha" : "Destino"}</AppText>
            </Pressable>
          ))}
        </View>
        {origin && destination ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: 12 }}>
            {drivingRoute.isFetching && !drivingRoute.data ? <ActivityIndicator color={colors.primary} /> : <MapPin size={20} color={colors.primary} />}
            <View style={{ flex: 1 }}>
              <AppText variant="title">{drivingRoute.data ? formatKm(drivingRoute.data.distanceKm) + " · " + formatDuration(drivingRoute.data.durationMin) : "A calcular a rota automóvel..."}</AppText>
              <AppText variant="tiny" color={colors.muted}>{drivingRoute.data?.source === "mock" ? "Estimativa mockada: a rota real será recalculada quando houver ligação." : "Rota mais rápida para automóvel pelas estradas."}</AppText>
            </View>
          </View>
        ) : null}
        {gpsError && !gpsPlace ? <AppText variant="tiny" color={colors.muted}>GPS indisponível. Podes marcar a recolha tocando no mapa.</AppText> : null}
        <PlaceField kind="origin" label="Local de recolha" place={origin} onPress={() => openPicker("origin")} onClear={() => { originWasSelectedManually.current = true; patch({ origin: null }); clearRoute(); setTarget("origin"); }} error={errors.origin} />
        {stops.map((stop, index) => <PlaceField key={stop.id + "-" + index} kind="stop" label={"Paragem " + (index + 1)} place={stop} onPress={() => undefined} onClear={() => { patch({ stops: stops.filter((_, itemIndex) => itemIndex !== index) }); clearRoute(); }} />)}
        <PlaceField kind="destination" label="Destino" place={destination} onPress={() => openPicker("destination")} onClear={() => { patch({ destination: null }); clearRoute(); setTarget("destination"); }} error={errors.destination} />
        {stops.length < 2 ? <SecondaryButton size="md" label="Adicionar paragem" icon={<CirclePlus size={22} color={colors.primary} />} onPress={() => openPicker("stop")} /> : null}
        <View style={{ paddingBottom: 12 }}><PrimaryButton label="Continuar" disabled={Boolean(origin && destination && drivingRoute.isFetching && !drivingRoute.data)} onPress={submit} trailingIcon={<ArrowRight size={22} color={colors.white} />} /></View>
      </SafeAreaView>
      <AddressPicker ref={picker} title={target === "origin" ? "Local de recolha" : target === "destination" ? "Destino" : "Adicionar paragem"} onPick={choose} />
    </View>
  );
}
