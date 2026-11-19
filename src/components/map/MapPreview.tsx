import { useState } from "react";
import { Platform, View } from "react-native";
import { useRoute } from "@/features/map/useRoute";
import { PulseRings } from "./PulseRings";
import { NativeMap } from "./NativeMap";
import type { MapPreviewProps } from "./types";

/**
 * Mapa da aplicação: react-native-maps no telemóvel e tiles OpenStreetMap na
 * web. A rota é a das estradas (OSRM), pedida aqui quando o ecrã só dá os dois pontos.
 */
export function MapPreview(props: MapPreviewProps) {
  const { height = 220, rounded = 0, accessibilityLabel = "Mapa do trajecto" } = props;
  const { data: resolved } = useRoute(props.route?.from, props.route?.to);
  const route = props.route ? { ...props.route, points: props.route.points ?? resolved?.points } : undefined;
  const [size, setSize] = useState({ width: 0, height: 0 });
  return (
    <View
      accessible={!props.zones?.length}
      accessibilityRole={props.zones?.length ? undefined : "image"}
      accessibilityLabel={accessibilityLabel}
      style={{ height, borderRadius: rounded, overflow: "hidden", backgroundColor: "#EEF1EC" }}
      onLayout={(e) => setSize(e.nativeEvent.layout)}
    >
      <NativeMap {...props} route={route} />
      {/* No mapa nativo a região centra-se na recolha, por isso o radar fica ao centro (na web o mapa desenha o seu). */}
      {Platform.OS !== "web" && props.pulse && size.width ? <PulseRings x={size.width / 2} y={size.height / 2} /> : null}
    </View>
  );
}

export type { MapMarker, MapZone, MapPreviewProps } from "./types";
