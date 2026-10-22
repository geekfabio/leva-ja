import { useEffect, useMemo, useRef } from "react";
import MapView, { Circle, Marker, Polyline, PROVIDER_DEFAULT, UrlTile } from "react-native-maps";
import { Text, View } from "react-native";
import { colors } from "@/theme/colors";
import { mockRoute, regionFor } from "@/utils/geo";
import { MarkerView } from "./MarkerView";
import type { MapPreviewProps } from "./types";

const LUANDA_REGION = {
  latitude: -8.8383,
  longitude: 13.2344,
  latitudeDelta: 0.28,
  longitudeDelta: 0.28,
};

/**
 * Mapa nativo baseado em tiles do OpenStreetMap. Mantém os marcadores e zonas
 * locais da aplicação e aceita uma polilinha de routing real quando disponível.
 */
export function NativeMap({
  markers = [],
  route,
  zones = [],
  static: isStatic,
  onZonePress,
  onMapPress,
  showsUserLocation = false,
}: MapPreviewProps) {
  const mapRef = useRef<MapView>(null);
  const focusedKey = useRef("");
  const routePoints = useMemo(
    () => route?.coordinates?.length ? route.coordinates : route ? mockRoute(route.from, route.to) : [],
    [route],
  );
  const points = useMemo(
    () => [...markers.map((marker) => marker.coords), ...routePoints, ...zones.map((zone) => zone.coords)],
    [markers, routePoints, zones],
  );
  const region = useMemo(
    () => points.length ? regionFor(points) : LUANDA_REGION,
    [points],
  );
  const focusKey = useMemo(
    () => points.map((point) => point.latitude.toFixed(4) + "," + point.longitude.toFixed(4)).join("|"),
    [points],
  );

  useEffect(() => {
    if (isStatic || !focusKey || focusedKey.current === focusKey) return;
    focusedKey.current = focusKey;
    mapRef.current?.animateToRegion(region, 420);
  }, [focusKey, isStatic, region]);

  return (
    <View style={{ flex: 1, backgroundColor: "#E8EEE7" }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        provider={PROVIDER_DEFAULT}
        mapType="none"
        initialRegion={region}
        region={isStatic ? region : undefined}
        scrollEnabled={!isStatic}
        zoomEnabled={!isStatic}
        rotateEnabled={false}
        pitchEnabled={false}
        toolbarEnabled={false}
        showsPointsOfInterest={false}
        showsUserLocation={showsUserLocation}
        onPress={isStatic ? undefined : (event) => onMapPress?.(event.nativeEvent.coordinate)}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
          zIndex={0}
        />
        {zones.map((zone) => (
          <Circle
            key={zone.id}
            center={zone.coords}
            radius={zone.radiusKm * 1000}
            strokeColor={zone.active ? colors.accent : colors.subtle}
            fillColor={zone.active ? "rgba(18,161,80,0.18)" : "rgba(91,107,99,0.08)"}
            strokeWidth={2}
          />
        ))}
        {zones.map((zone) => (
          <Marker
            key={"z-" + zone.id}
            coordinate={zone.coords}
            onPress={() => onZonePress?.(zone.id)}
            title={zone.label}
            pinColor={zone.active ? colors.accent : colors.subtle}
          />
        ))}
        {routePoints.length ? <Polyline coordinates={routePoints} strokeColor={colors.accent} strokeWidth={5} /> : null}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coords}
            anchor={marker.kind === "destination" ? { x: 0.5, y: 1 } : { x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
          >
            <MarkerView marker={marker} />
          </Marker>
        ))}
      </MapView>
      <View pointerEvents="none" style={{ position: "absolute", right: 8, bottom: 6, backgroundColor: "rgba(255,255,255,0.88)", borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 }}>
        <Text style={{ fontSize: 9, color: "#415248" }}>© OpenStreetMap contributors</Text>
      </View>
    </View>
  );
}
