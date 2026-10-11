import { ActivityIndicator, Pressable, Text } from "react-native";
import { ReactNode, useState } from "react";
import palette from "@/theme/palette.json";

type Props = {
  label: string;
  onPress?: () => void;
  icon?: ReactNode;
  variant?: "primary" | "ghost" | "danger";
  disabled?: boolean;
  loading?: boolean;
};

export function AppButton({
  label,
  onPress,
  icon,
  variant = "primary",
  disabled = false,
  loading = false,
}: Props) {
  const [focused, setFocused] = useState(false);
  const blocked = disabled || loading;
  const color =
    variant === "danger"
      ? "#FFFFFF"
      : variant === "primary"
        ? palette.ink
        : palette.greenDark;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: blocked, busy: loading }}
      onPress={onPress}
      disabled={blocked}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => ({
        minHeight: 56,
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        backgroundColor:
          variant === "primary"
            ? palette.green
            : variant === "danger"
              ? "#B42318"
              : palette.greenSoft,
        borderWidth: 2,
        borderColor: focused ? palette.ink : "transparent",
        opacity: blocked ? 0.45 : pressed ? 0.78 : 1,
      })}
    >
      {loading ? <ActivityIndicator color={color} /> : icon}
      <Text
        style={{
          color,
          fontSize: 16,
          fontWeight: "700",
          textAlign: "center",
          flexShrink: 1,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
