import { useState } from "react";
import { Text, View } from "react-native";
import { PulseRings } from "./PulseRings";
import { MockMapCanvas } from "./MockMapCanvas";
import { NativeMap } from "./NativeMap";
import type { MapPreviewProps } from "./types";

const forceMock = process.env.EXPO_PUBLIC_MOCK_MAP === "1";

/**
 * Mapa da aplicação. Nativo: react-native-maps; web, testes ou
 * EXPO_PUBLIC_MOCK_MAP=1: mapa ilustrativo em SVG. Os dados são sempre mockados.
 */
export function MapPreview(props: MapPreviewProps) {
  const { height = 220, rounded = 0, accessibilityLabel = "Mapa ilustrativo do trajecto" } = props;
  const Map = forceMock ? MockMapCanvas : NativeMap;
  const native = Map === NativeMap && NativeMap !== (MockMapCanvas as unknown);
  const [size, setSize] = useState({ width: 0, height: 0 });
  return (
    <View
      accessible={!props.zones?.length}
      accessibilityRole={props.zones?.length ? undefined : "image"}
      accessibilityLabel={accessibilityLabel}
      style={{ height, borderRadius: rounded, overflow: "hidden", backgroundColor: "#EEF1EC" }}
      onLayout={(e) => setSize(e.nativeEvent.layout)}
    >
      <Map {...props} />
      {native ? (
        <View pointerEvents="none" style={{ position: "absolute", right: 5, bottom: 4, backgroundColor: "rgba(255,255,255,0.86)", borderRadius: 3, paddingHorizontal: 4, paddingVertical: 2 }}>
          <Text style={{ color: "#334139", fontSize: 9 }}>© OpenStreetMap contributors</Text>
        </View>
      ) : null}
      {/* No mapa nativo a região centra-se na recolha, por isso o radar fica ao centro. */}
      {native && props.pulse && size.width ? <PulseRings x={size.width / 2} y={size.height / 2} /> : null}
    </View>
  );
}

export type { MapMarker, MapZone, MapPreviewProps } from "./types";
