import { createElement, useMemo } from "react";
import { View } from "react-native";
import { regionFor } from "@/utils/geo";
import type { MapPreviewProps } from "./types";

/**
 * react-native-maps não desenha mapas na web. Usa o embed oficial do OSM para
 * que a revisão no browser também mostre cartografia real; a interacção completa
 * (toque, zoom nativo e rota) continua disponível no Android/iOS.
 */
export function NativeMap({ markers = [], route }: MapPreviewProps) {
  const points = useMemo(() => [...markers.map((marker) => marker.coords), ...(route ? [route.from, ...(route.via ?? []), route.to] : [])], [markers, route]);
  const region = useMemo(() => (points.length ? regionFor(points) : { latitude: -12.3, longitude: 17.6, latitudeDelta: 15.5, longitudeDelta: 15.5 }), [points]);
  const west = region.longitude - region.longitudeDelta / 2;
  const east = region.longitude + region.longitudeDelta / 2;
  const south = region.latitude - region.latitudeDelta / 2;
  const north = region.latitude + region.latitudeDelta / 2;
  const marker = markers[0]?.coords;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${west},${south},${east},${north}&layer=mapnik${marker ? `&marker=${marker.latitude},${marker.longitude}` : ""}`;

  return (
    <View style={{ flex: 1, overflow: "hidden", backgroundColor: "#EEF1EC" }}>
      {createElement("iframe", {
        title: "Mapa OpenStreetMap",
        src,
        style: { width: "100%", height: "100%", border: 0 },
        loading: "lazy",
        allowFullScreen: true,
      })}
    </View>
  );
}
