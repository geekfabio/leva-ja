import { ReactNode } from "react";
import {View, type StyleProp, type ViewStyle} from "react-native";
import { colors, radius, shadow } from "@/theme/colors";
import { ScalePressable } from "./Motion";

type Props = {
  children: ReactNode;
  onPress?: () => void;
  tone?: "white" | "soft" | "deep" | "muted";
  padding?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  elevated?: boolean;
};

const backgrounds = {
  white: colors.card,
  soft: colors.primarySoft,
  deep: colors.deep,
  muted: "#F1F4F2",
};

/** Cartão arredondado base. Com `onPress` torna-se um botão acessível. */
export function Card({ children, onPress, tone = "white", padding = 16, style, accessibilityLabel, elevated = tone === "white" }: Props) {
  const base: ViewStyle = {
    backgroundColor: backgrounds[tone],
    borderRadius: radius.lg,
    padding,
    borderWidth: tone === "white" ? 1 : 0,
    borderColor: colors.border,
  };
  if (!onPress)
    return <View style={[base, elevated ? shadow.card : null, style]}>{children}</View>;
  return (
    <ScalePressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [base, elevated ? shadow.card : null, { opacity: pressed ? 0.85 : 1 }, style]}
    >
      {children}
    </ScalePressable>
  );
}

export function Divider({ inset = 0, vertical = false }: { inset?: number; vertical?: boolean }) {
  return vertical ? (
    <View style={{ width: 1, alignSelf: "stretch", backgroundColor: colors.border }} />
  ) : (
    <View style={{ height: 1, backgroundColor: colors.border, marginLeft: inset }} />
  );
}

/** Círculo/quadrado suave com ícone (padrão das listas e cartões das referências). */
export function IconCircle({
  children,
  size = 48,
  tone = "soft",
  shape = "circle",
}: {
  children: ReactNode;
  size?: number;
  tone?: "soft" | "white" | "primary" | "danger" | "deep" | "warning";
  shape?: "circle" | "rounded";
}) {
  const bg = {
    soft: colors.primarySoft,
    white: colors.card,
    primary: colors.primary,
    danger: colors.danger,
    deep: "rgba(255,255,255,0.12)",
    warning: colors.warningSoft,
  }[tone];
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: shape === "circle" ? size / 2 : radius.md,
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </View>
  );
}
