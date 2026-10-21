import { View } from "react-native";
import { MapPin, Package, Truck, Car } from "lucide-react-native";
import { colors, shadow } from "@/theme/colors";
import { AppText } from "@/components/core/AppText";
import type { MapMarker } from "./types";
import { TowTruckIcon } from "@/components/service/ServiceIcon";

/** Aparência dos marcadores, partilhada pelo mapa nativo e pelo mapa mock. */
export function MarkerView({ marker }: { marker: MapMarker }) {
  const bubble = marker.bubble ? (
    <View style={[{ backgroundColor: colors.card, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginLeft: 6 }, shadow.card]}>
      <AppText variant="tiny" weight="bold">
        {marker.bubble}
      </AppText>
    </View>
  ) : null;
  const label = marker.label ? (
    <View style={{ backgroundColor: "rgba(255,255,255,0.92)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginTop: 2 }}>
      <AppText variant="tiny" weight="bold">
        {marker.label}
      </AppText>
    </View>
  ) : null;

  if (marker.kind === "origin" || marker.kind === "stop")
    return (
      <View style={{ alignItems: "center" }}>
        <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: colors.white }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.white }} />
        </View>
        {label}
      </View>
    );
  if (marker.kind === "destination")
    return (
      <View style={{ alignItems: "center" }}>
        <MapPin size={34} color={colors.white} fill={colors.danger} strokeWidth={1.5} />
        {label}
      </View>
    );
  if (marker.kind === "user")
    return (
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(37, 99, 235, 0.18)", alignItems: "center", justifyContent: "center" }}>
        <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: "#2563EB", borderWidth: 3, borderColor: colors.white }} />
      </View>
    );
  const Icon = marker.icon === "tow" ? TowTruckIcon : marker.icon === "move" ? Truck : marker.kind === "request" ? Package : Car;
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <View
        style={[
          {
            width: marker.kind === "vehicle" ? 40 : 44,
            height: marker.kind === "vehicle" ? 40 : 44,
            borderRadius: 22,
            backgroundColor: marker.kind === "vehicle" ? colors.card : colors.primary,
            borderWidth: 3,
            borderColor: marker.kind === "vehicle" ? colors.accent : colors.white,
            alignItems: "center",
            justifyContent: "center",
          },
          shadow.floating,
        ]}
      >
        <Icon size={20} color={marker.kind === "vehicle" ? colors.ink : colors.white} />
      </View>
      {bubble}
    </View>
  );
}
