import { ReactNode } from "react";
import {View} from "react-native";
import { colors, shadow } from "@/theme/colors";
import { ScalePressable } from "./Motion";

type Props = {
  icon: ReactNode;
  label: string;
  onPress?: () => void;
  variant?: "plain" | "floating" | "soft" | "inverse";
  size?: number;
  badge?: boolean;
};

/** Botão só com ícone; área de toque mínima de 44 pt. */
export function IconButton({ icon, label, onPress, variant = "plain", size = 44, badge }: Props) {
  const bg = {
    plain: "transparent",
    floating: colors.card,
    soft: colors.primarySoft,
    inverse: "rgba(255,255,255,0.14)",
  }[variant];
  return (
    <ScalePressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      scaleTo={0.88}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: bg,
          opacity: pressed ? 0.7 : 1,
        },
        variant === "floating" ? shadow.floating : null,
      ]}
    >
      {icon}
      {badge ? (
        <View
          style={{
            position: "absolute",
            top: 9,
            right: 10,
            width: 9,
            height: 9,
            borderRadius: 5,
            backgroundColor: colors.danger,
            borderWidth: 1.5,
            borderColor: colors.card,
          }}
        />
      ) : null}
    </ScalePressable>
  );
}
