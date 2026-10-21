import { useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import Svg, { Circle, Path, Polyline, Rect } from "react-native-svg";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from "react-native-reanimated";
import { placeList } from "@/mocks/places";
import { boundsOf, mockRoute } from "@/utils/geo";
import { colors } from "@/theme/colors";
import { AppText } from "@/components/core/AppText";
import { MarkerView } from "./MarkerView";
import type { MapPreviewProps } from "./types";

const KM_PER_DEG = 111;

/**
 * Mapa ilustrativo em SVG (sem tiles nem rede). Usado na web, nos testes e quando
 * EXPO_PUBLIC_MOCK_MAP=1. Projecção equirectangular simples sobre Luanda.
 */
export function MockMapCanvas({ markers = [], route, zones = [], pulse, onZonePress }: MapPreviewProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const routePoints = useMemo(() => (route ? mockRoute(route.from, route.to) : []), [route]);

  const bounds = useMemo(() => {
    const pts = [
      ...markers.map((m) => m.coords),
      ...routePoints,
      ...zones.flatMap((z) => [
        { latitude: z.coords.latitude + z.radiusKm / KM_PER_DEG, longitude: z.coords.longitude },
        { latitude: z.coords.latitude - z.radiusKm / KM_PER_DEG, longitude: z.coords.longitude },
      ]),
    ];
    const b = boundsOf(pts.length ? pts : placeList.map((p) => p.coords), 0.3);
    if (!size.width || !size.height) return b;
    // Ajusta a caixa à proporção do componente para não deformar o mapa.
    const latSpan = b.maxLat - b.minLat;
    const lonSpan = b.maxLon - b.minLon;
    const target = size.width / size.height;
    if (lonSpan / latSpan < target) {
      const extra = (latSpan * target - lonSpan) / 2;
      return { ...b, minLon: b.minLon - extra, maxLon: b.maxLon + extra };
    }
    const extra = (lonSpan / target - latSpan) / 2;
    return { ...b, minLat: b.minLat - extra, maxLat: b.maxLat + extra };
  }, [markers, routePoints, zones, size]);

  const project = (lat: number, lon: number) => ({
    x: ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * size.width,
    y: ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * size.height,
  });
  const pxPerKm = size.height / ((bounds.maxLat - bounds.minLat) * KM_PER_DEG);

  // Costa aproximada de Luanda: o mar fica a noroeste da linha de costa.
  const coast = [
    [-8.76, 13.26], [-8.79, 13.235], [-8.805, 13.22], [-8.83, 13.2], [-8.86, 13.18], [-8.9, 13.15], [-8.95, 13.12], [-9.05, 13.08],
  ].map(([lat, lon]) => project(lat!, lon!));
  const sea = `M ${coast.map((p) => `${p.x} ${p.y}`).join(" L ")} L -2000 ${size.height + 2000} L -2000 -2000 L ${coast[0]!.x + 2000} -2000 Z`;

  const pulseScale = useSharedValue(0.6);
  useEffect(() => {
    pulseScale.value = withRepeat(withTiming(1.4, { duration: 1600, easing: Easing.out(Easing.quad) }), -1, false);
  }, [pulseScale]);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulseScale.value }], opacity: 1.4 - pulseScale.value }));
  const pulseCenter = pulse ? markers.find((m) => m.kind === "origin" || m.kind === "user") : undefined;

  return (
    <View style={{ flex: 1, backgroundColor: colors.mapLand, overflow: "hidden" }} onLayout={(e) => setSize(e.nativeEvent.layout)}>
      {size.width > 0 ? (
        <>
          <Svg width={size.width} height={size.height} accessible={false}>
            <Rect x={0} y={0} width={size.width} height={size.height} fill={colors.mapLand} />
            {Array.from({ length: 9 }, (_, i) => (
              <Path
                key={`r${i}`}
                d={`M ${-50 + i * (size.width / 6)} ${size.height + 40} L ${i * (size.width / 6) + size.width * 0.35} -40`}
                stroke={colors.mapRoad}
                strokeWidth={i % 3 === 0 ? 7 : 3}
              />
            ))}
            {Array.from({ length: 7 }, (_, i) => (
              <Path key={`h${i}`} d={`M -40 ${i * (size.height / 5)} L ${size.width + 40} ${i * (size.height / 5) + 60}`} stroke={colors.mapRoad} strokeWidth={i % 2 === 0 ? 5 : 2.5} />
            ))}
            <Circle cx={size.width * 0.72} cy={size.height * 0.3} r={28} fill={colors.mapPark} />
            <Circle cx={size.width * 0.25} cy={size.height * 0.78} r={36} fill={colors.mapPark} />
            <Path d={sea} fill={colors.mapWater} />
            {zones.map((zone) => {
              const c = project(zone.coords.latitude, zone.coords.longitude);
              return (
                <Circle
                  key={zone.id}
                  cx={c.x}
                  cy={c.y}
                  r={zone.radiusKm * pxPerKm}
                  fill={zone.active ? "rgba(18,161,80,0.18)" : "rgba(91,107,99,0.08)"}
                  stroke={zone.active ? colors.accent : colors.subtle}
                  strokeWidth={2}
                  strokeDasharray="6 5"
                />
              );
            })}
            {routePoints.length ? (
              <Polyline
                points={routePoints.map((p) => { const q = project(p.latitude, p.longitude); return `${q.x},${q.y}`; }).join(" ")}
                fill="none"
                stroke={colors.accent}
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
          </Svg>
          {(zones.length ? [] : placeList)
            .filter((p, i, all) => all.findIndex((o) => o.area === p.area) === i)
            .map((p) => {
              const q = project(p.coords.latitude, p.coords.longitude);
              if (q.x < 10 || q.y < 10 || q.x > size.width - 60 || q.y > size.height - 20) return null;
              if (markers.some((m) => Math.hypot(project(m.coords.latitude, m.coords.longitude).x - q.x, project(m.coords.latitude, m.coords.longitude).y - q.y) < 50)) return null;
              return (
                <AppText key={p.id} variant="tiny" color={colors.subtle} style={{ position: "absolute", left: q.x, top: q.y }} accessible={false}>
                  {p.area}
                </AppText>
              );
            })}
          {zones.map((zone) => {
            const c = project(zone.coords.latitude, zone.coords.longitude);
            return (
              <Pressable
                key={`l-${zone.id}`}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: zone.active }}
                accessibilityLabel={`Zona ${zone.label}`}
                onPress={() => onZonePress?.(zone.id)}
                style={{ position: "absolute", left: c.x - 44, top: c.y - 22, width: 88, alignItems: "center", gap: 4 }}
              >
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: zone.active ? colors.accent : colors.subtle, borderWidth: 2, borderColor: colors.white }} />
                <View style={{ backgroundColor: zone.active ? colors.primary : colors.subtle, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                  <AppText variant="tiny" weight="bold" color={colors.white}>
                    {zone.label}
                  </AppText>
                </View>
              </Pressable>
            );
          })}
          {pulseCenter ? (
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: "absolute",
                  width: 160,
                  height: 160,
                  borderRadius: 80,
                  backgroundColor: "rgba(18,161,80,0.22)",
                  left: project(pulseCenter.coords.latitude, pulseCenter.coords.longitude).x - 80,
                  top: project(pulseCenter.coords.latitude, pulseCenter.coords.longitude).y - 80,
                },
                pulseStyle,
              ]}
            />
          ) : null}
          {markers.map((marker) => {
            const q = project(marker.coords.latitude, marker.coords.longitude);
            const anchorBottom = marker.kind === "destination";
            return (
              <View
                key={marker.id}
                pointerEvents="none"
                style={{ position: "absolute", left: q.x - 22, top: anchorBottom ? q.y - 34 : q.y - 22, minWidth: 44, alignItems: "flex-start" }}
              >
                <View style={{ marginLeft: marker.kind === "destination" ? 5 : marker.kind === "origin" || marker.kind === "stop" ? 11 : 0 }}>
                  <MarkerView marker={marker} />
                </View>
              </View>
            );
          })}
        </>
      ) : null}
    </View>
  );
}
