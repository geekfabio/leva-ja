import { useEffect, useMemo, useRef, useState } from "react";
import { Image, PanResponder, Pressable, View } from "react-native";
import Svg, { Circle, Polyline } from "react-native-svg";
import Animated, { Easing, ZoomIn, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { Minus, Plus } from "lucide-react-native";
import { AppText } from "@/components/core/AppText";
import { useMotionEnabled } from "@/components/core/Motion";
import { env } from "@/config/env";
import type { Coordinates } from "@/types/domain";
import { LUANDA_VIEW, fitView, metersPerPixel, project, tileUrl, toScreen, unproject, visibleTiles } from "@/utils/mapProjection";
import { colors } from "@/theme/colors";
import { MarkerView } from "./MarkerView";
import { PulseRings } from "./PulseRings";
import type { MapPreviewProps } from "./types";

type View_ = { center: Coordinates; zoom: number };
const MIN_ZOOM = 5;
const MAX_ZOOM = 18;

/** O marcador da viatura desliza entre leituras do GPS em vez de saltar; os outros entram com um pequeno "pop". */
function PositionedMarker({ x, y, glide, children }: { x: number; y: number; glide: boolean; children: React.ReactNode }) {
  const enabled = useMotionEnabled();
  const left = useSharedValue(x);
  const top = useSharedValue(y);
  useEffect(() => {
    const animate = enabled && glide;
    left.value = animate ? withTiming(x, { duration: 950, easing: Easing.linear }) : x;
    top.value = animate ? withTiming(y, { duration: 950, easing: Easing.linear }) : y;
  }, [x, y, glide, enabled, left, top]);
  const style = useAnimatedStyle(() => ({ left: left.value, top: top.value }));
  return (
    <Animated.View pointerEvents="none" entering={enabled ? ZoomIn.duration(260) : undefined} style={[{ position: "absolute", minWidth: 44, alignItems: "flex-start" }, style]}>
      {children}
    </Animated.View>
  );
}

/**
 * Mapa da versão web: tiles OpenStreetMap (`EXPO_PUBLIC_MAP_TILES_URL`) com
 * projecção Web Mercator, como o mapa do painel. Arrasta-se e faz zoom com os
 * botões; os marcadores, zonas e rota vêm das mesmas props do mapa nativo.
 */
export function WebMap({ markers = [], route, zones = [], pulse, static: isStatic, onZonePress }: MapPreviewProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [moved, setMoved] = useState<View_ | null>(null);
  const routePoints = useMemo(() => route?.points ?? (route ? [route.from, route.to] : []), [route]);

  const fitted = useMemo(() => {
    if (!size.width || !size.height) return null;
    const points = [
      ...markers.map((m) => m.coords),
      ...routePoints,
      ...zones.flatMap((z) => [
        { latitude: z.coords.latitude + z.radiusKm / 111, longitude: z.coords.longitude },
        { latitude: z.coords.latitude - z.radiusKm / 111, longitude: z.coords.longitude },
      ]),
    ];
    return fitView(points, size, { padding: 56, minZoom: MIN_ZOOM, maxZoom: 16 });
  }, [markers, routePoints, zones, size]);

  // Enquanto o utilizador não mexe no mapa, a vista acompanha o que há para mostrar.
  const view: View_ = moved ?? fitted ?? LUANDA_VIEW;
  const viewRef = useRef(view);
  viewRef.current = view;

  const drag = useRef<{ x: number; y: number; center: Coordinates; zoom: number } | null>(null);
  const responder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) + Math.abs(g.dy) > 4,
        onPanResponderGrant: () => {
          const { center, zoom } = viewRef.current;
          drag.current = { x: 0, y: 0, center, zoom };
        },
        onPanResponderMove: (_, g) => {
          const start = drag.current;
          if (!start) return;
          const world = project(start.center, start.zoom);
          setMoved({ center: unproject({ x: world.x - g.dx, y: world.y - g.dy }, start.zoom), zoom: start.zoom });
        },
        onPanResponderRelease: () => {
          drag.current = null;
        },
      }),
    [],
  );

  const zoomBy = (delta: number) => {
    const { center, zoom } = viewRef.current;
    setMoved({ center, zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom + delta)) });
  };

  const screen = (point: Coordinates) => toScreen(point, view.center, view.zoom, size);
  const tiles = size.width ? visibleTiles(view.center, view.zoom, size) : [];
  const pulseCenter = pulse ? markers.find((m) => m.kind === "origin" || m.kind === "user") : undefined;

  return (
    <View style={{ flex: 1, backgroundColor: colors.mapLand, overflow: "hidden" }} onLayout={(e) => setSize(e.nativeEvent.layout)} {...(isStatic ? {} : responder.panHandlers)}>
      {size.width > 0 ? (
        <>
          <View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0 }}>
            {tiles.map((tile) => (
              <Image
                key={tile.key}
                accessible={false}
                source={{ uri: tileUrl(env.mapTilesUrl, tile) }}
                style={{ position: "absolute", left: Math.round(tile.left), top: Math.round(tile.top), width: 256, height: 256 }}
              />
            ))}
          </View>
          <Svg width={size.width} height={size.height} pointerEvents="none" style={{ position: "absolute", left: 0, top: 0 }}>
            {zones.map((zone) => {
              const c = screen(zone.coords);
              return (
                <Circle
                  key={zone.id}
                  cx={c.x}
                  cy={c.y}
                  r={(zone.radiusKm * 1000) / metersPerPixel(zone.coords.latitude, view.zoom)}
                  fill={zone.active ? "rgba(18,161,80,0.18)" : "rgba(91,107,99,0.08)"}
                  stroke={zone.active ? colors.accent : colors.subtle}
                  strokeWidth={2}
                  strokeDasharray="6 5"
                />
              );
            })}
            {routePoints.length > 1 ? (
              <Polyline
                points={routePoints.map((p) => { const q = screen(p); return `${q.x.toFixed(1)},${q.y.toFixed(1)}`; }).join(" ")}
                fill="none"
                stroke={colors.accent}
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
          </Svg>
          {zones.map((zone) => {
            const c = screen(zone.coords);
            return (
              <Pressable
                key={`l-${zone.id}`}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: zone.active }}
                aria-checked={zone.active}
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
          {pulseCenter ? <PulseRings x={screen(pulseCenter.coords).x} y={screen(pulseCenter.coords).y} /> : null}
          {markers.map((marker) => {
            const q = screen(marker.coords);
            return (
              <PositionedMarker key={marker.id} x={q.x - 22} y={marker.kind === "destination" ? q.y - 34 : q.y - 22} glide={marker.kind === "vehicle"}>
                <View style={{ marginLeft: marker.kind === "destination" ? 5 : marker.kind === "origin" || marker.kind === "stop" ? 11 : 0 }}>
                  <MarkerView marker={marker} />
                </View>
              </PositionedMarker>
            );
          })}
          {isStatic ? null : (
            <View style={{ position: "absolute", right: 10, bottom: 26, gap: 6 }}>
              <Pressable accessibilityRole="button" accessibilityLabel="Aproximar mapa" onPress={() => zoomBy(1)} style={zoomButton}>
                <Plus size={20} color={colors.ink} />
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Afastar mapa" onPress={() => zoomBy(-1)} style={zoomButton}>
                <Minus size={20} color={colors.ink} />
              </Pressable>
            </View>
          )}
          <View pointerEvents="none" style={{ position: "absolute", left: 0, bottom: 0, backgroundColor: "rgba(255,255,255,0.8)", paddingHorizontal: 5, paddingVertical: 1 }}>
            <AppText variant="tiny" color={colors.text}>
              © OpenStreetMap contributors
            </AppText>
          </View>
        </>
      ) : null}
    </View>
  );
}

const zoomButton = { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.card, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border } as const;
