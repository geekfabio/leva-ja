import { useMemo } from "react";
import MapView, { Circle, Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import { colors } from "@/theme/colors";
import { mockRoute, regionFor } from "@/utils/geo";
import { placeList } from "@/mocks/places";
import { MarkerView } from "./MarkerView";
import type { MapPreviewProps } from "./types";

/**
 * Mapa nativo (react-native-maps) com dados mockados: marcadores, trajecto
 * simulado e zonas. Não usa GPS real nem serviços de rotas.
 */
export function NativeMap({ markers = [], route, zones = [], static: isStatic, onZonePress }: MapPreviewProps) {
  const routePoints = useMemo(() => (route ? mockRoute(route.from, route.to) : []), [route]);
  const region = useMemo(() => {
    const pts = [...markers.map((m) => m.coords), ...routePoints, ...zones.map((z) => z.coords)];
    return regionFor(pts.length ? pts : placeList.map((p) => p.coords));
  }, [markers, routePoints, zones]);

  return (
    <MapView
      style={{ flex: 1 }}
      provider={PROVIDER_DEFAULT}
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
    >
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
