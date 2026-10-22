import { ReactNode } from "react";
import {ActivityIndicator, View, type StyleProp, type ViewStyle} from "react-native";
import { colors, radius } from "@/theme/colors";
import { AppText } from "./AppText";
import { ScalePressable } from "./Motion";

type Variant = "primary" | "secondary" | "outline" | "danger" | "dangerOutline" | "ghost";

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  icon?: ReactNode;
  /** Ícone à direita, ex.: seta "Continuar →". */
  trailingIcon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  size?: "lg" | "md" | "sm";
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const palette: Record<Variant, { bg: string; fg: string; border: string; pressed: string }> = {
  primary: { bg: colors.primary, fg: colors.white, border: colors.primary, pressed: colors.primaryPressed },
  secondary: { bg: colors.primarySoft, fg: colors.primary, border: colors.primarySoft, pressed: colors.primaryTint },
  outline: { bg: colors.card, fg: colors.primary, border: colors.primary, pressed: colors.primarySoft },
  danger: { bg: colors.danger, fg: colors.white, border: colors.danger, pressed: "#B42318" },
  dangerOutline: { bg: colors.dangerSoft, fg: colors.danger, border: "#F4B4AE", pressed: "#FAD7D3" },
  ghost: { bg: "transparent", fg: colors.primary, border: "transparent", pressed: colors.primarySoft },
};

const heights = { lg: 56, md: 48, sm: 40 };

function BaseButton({
  variant,
  label,
  onPress,
  icon,
  trailingIcon,
  disabled,
  loading,
  size = "lg",
  accessibilityHint,
  style,
  testID,
}: ButtonProps & { variant: Variant }) {
  const tone = palette[variant];
  const blocked = disabled || loading;
  return (
    <ScalePressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!blocked, busy: !!loading }}
      disabled={blocked}
      onPress={onPress}
      hitSlop={size === "sm" ? 6 : 0}
      style={({ pressed }) => [
        {
          minHeight: heights[size],
          borderRadius: size === "sm" ? radius.sm : radius.md,
          paddingHorizontal: size === "sm" ? 14 : 20,
          backgroundColor: pressed ? tone.pressed : tone.bg,
          borderWidth: variant === "primary" || variant === "danger" || variant === "ghost" ? 0 : 1.5,
          borderColor: tone.border,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          opacity: blocked && !loading ? 0.45 : 1,
        },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={tone.fg} /> : icon}
      <AppText
        variant={size === "lg" ? "title" : "label"}
        weight="bold"
        color={tone.fg}
        numberOfLines={1}
        style={{ fontSize: size === "lg" ? 17 : size === "md" ? 15 : 14, flexShrink: 1 }}
      >
        {label}
      </AppText>
      {trailingIcon && !loading ? (
        <View style={{ position: size === "lg" ? "absolute" : "relative", right: size === "lg" ? 20 : 0 }}>
          {trailingIcon}
        </View>
      ) : null}
    </ScalePressable>
  );
}

export const PrimaryButton = (props: ButtonProps) => <BaseButton variant="primary" {...props} />;
/** Botão secundário: contorno verde por omissão (ref. "Contactar", "Cancelar pedido"). */
export const SecondaryButton = ({ tone = "outline", ...props }: ButtonProps & { tone?: "outline" | "soft" }) => (
  <BaseButton variant={tone === "soft" ? "secondary" : "outline"} {...props} />
);
export const DangerButton = ({ tone = "solid", ...props }: ButtonProps & { tone?: "solid" | "outline" }) => (
  <BaseButton variant={tone === "solid" ? "danger" : "dangerOutline"} {...props} />
);
export const TextButton = (props: ButtonProps) => <BaseButton variant="ghost" size="md" {...props} />;
