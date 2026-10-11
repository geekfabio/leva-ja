import { Image, View } from "react-native";
import { VehicleId, vehicles } from "@/domain/catalog";

/** One local 3D atlas, six fixed cells. Clipping is layout-only; no remote image dependency. */
export function VehicleArt({
  vehicle,
  size = 120,
}: {
  vehicle: VehicleId;
  size?: number;
}) {
  const cell = vehicles[vehicle].cell;
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Imagem 3D: ${vehicles[vehicle].name}`}
      style={{ width: size, height: size, overflow: "hidden" }}
    >
      <Image
        accessible={false}
        source={require("../../../assets/vehicles/fleet-3d.png")}
        resizeMode="stretch"
        style={{
          position: "absolute",
          width: size * 3,
          height: size * 2,
          left: -(cell % 3) * size,
          top: -Math.floor(cell / 3) * size,
        }}
      />
    </View>
  );
}
