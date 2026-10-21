import Svg, { Circle, Path } from "react-native-svg";
import { House, Package, Truck } from "lucide-react-native";
import type { ServiceKind } from "@/types/domain";
import { colors } from "@/theme/colors";

type IconProps = { size?: number; color?: string; strokeWidth?: number };

/** Reboque no estilo Lucide (traço 2, grelha 24) — o Lucide não tem este ícone. */
export function TowTruckIcon({ size = 24, color = colors.ink, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M14 16V9h3.5l3.5 4v3h-1.5" />
      <Path d="M2 16h1.5M8.5 16h6" />
      <Path d="M2 13h12" />
      <Path d="M4 13 9.5 5.5" />
      <Path d="M9.5 5.5V8a1.5 1.5 0 1 1-1.5 1.5" />
      <Circle cx={6} cy={16.5} r={2} />
      <Circle cx={17} cy={16.5} r={2} />
    </Svg>
  );
}

/** Pickup tipo Hilux no estilo Lucide. */
export function PickupIcon({ size = 24, color = colors.ink, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3.5 16.5H2V12h9.5l2-4h4.5l3 4H22v4.5h-1.5" />
      <Path d="M8.5 16.5h7" />
      <Path d="M13.5 8.2V12h7" />
      <Circle cx={6} cy={17} r={2} />
      <Circle cx={18} cy={17} r={2} />
    </Svg>
  );
}

export function ServiceIcon({
  kind,
  variant,
  ...props
}: IconProps & { kind: ServiceKind; variant?: "tow" | "pickup" | "van" | "house" | "package" }) {
  const v = variant ?? { tow: "tow", cargo: "pickup", small_move: "van", house_move: "house" }[kind];
  const style = { size: props.size ?? 24, color: props.color ?? colors.ink, strokeWidth: props.strokeWidth ?? 2 };
  if (v === "tow") return <TowTruckIcon {...style} />;
  if (v === "pickup") return <PickupIcon {...style} />;
  if (v === "house") return <House {...style} />;
  if (v === "package") return <Package {...style} />;
  return <Truck {...style} />;
}
