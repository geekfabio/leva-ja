import { View } from "react-native";
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
  return (
    <View
      accessible={!props.zones?.length}
      accessibilityRole={props.zones?.length ? undefined : "image"}
      accessibilityLabel={accessibilityLabel}
      style={{ height, borderRadius: rounded, overflow: "hidden", backgroundColor: "#EEF1EC" }}
    >
      <Map {...props} />
    </View>
  );
}

export type { MapMarker, MapZone, MapPreviewProps } from "./types";
