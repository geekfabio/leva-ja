import { useEffect, useMemo, useRef } from "react";
import { Platform } from "react-native";
import MapView, { Circle, Marker, Polyline, PROVIDER_DEFAULT, UrlTile } from "react-native-maps";
import { colors } from "@/theme/colors";
import { mockRoute, regionFor } from "@/utils/geo";
import { useDrivingRoute } from "@/services/routing";
import { MarkerView } from "./MarkerView";
import type { MapPreviewProps } from "./types";

/**
 * Mapa nativo interactivo com tiles OpenStreetMap e trajectos OSRM.
 * Marcadores e zonas continuam a aceitar os dados mockados da demonstração.
 */
const ANGOLA_REGION = { latitude: -12.3, longitude: 17.6, latitudeDelta: 15.5, longitudeDelta: 15.5 };
const osmTileUrl = process.env.EXPO_PUBLIC_OSM_TILE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

export function NativeMap({ markers = [], route, zones = [], static: isStatic, onZonePress, onMapPress }: MapPreviewProps) {
  const mapRef = useRef<MapView>(null);
  const routeInput = useMemo(() => (route ? [route.from, ...(route.via ?? []), route.to] : []), [route]);
  const calculated = useDrivingRoute(routeInput, !!route && !route.coordinates?.length);
  const routePoints = useMemo(
    () => route?.coordinates ?? calculated.data?.coordinates ?? (route ? mockRoute(route.from, route.to) : []),
    [route, calculated.data?.coordinates],
  );
  const region = useMemo(() => {
    const pts = [...markers.map((m) => m.coords), ...routePoints, ...zones.map((z) => z.coords)];
    return pts.length ? regionFor(pts) : ANGOLA_REGION;
  }, [markers, routePoints, zones]);

  useEffect(() => {
    if (markers.length || routePoints.length || zones.length) mapRef.current?.animateToRegion(region, 500);
  }, [region, markers.length, routePoints.length, zones.length]);

  return (
    <MapView
      ref={mapRef}
      style={{ flex: 1 }}
      provider={PROVIDER_DEFAULT}
      mapType={Platform.OS === "android" ? "none" : "standard"}
      initialRegion={region}
      region={isStatic ? region : undefined}
      scrollEnabled={!isStatic}
      zoomEnabled={!isStatic}
      rotateEnabled={false}
      pitchEnabled={false}
      toolbarEnabled={false}
      showsPointsOfInterest={false}
      showsUserLocation={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      onPress={(event) => onMapPress?.(event.nativeEvent.coordinate)}
    >
      <UrlTile urlTemplate={osmTileUrl} maximumZ={19} flipY={false} />
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
          key={`z-${zone.id}`}
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
  );
}
