import { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Switch } from "react-native-paper";
import { Check, Minus, Plus, Star } from "lucide-react-native";
import { colors, radius } from "@/theme/colors";
import { AppText } from "./AppText";

/** Contador − 3 + (ref. 16: pisos, ajudantes, divisões). */
export function Stepper({
  value,
  onChange,
  min = 0,
  max = 99,
  label,
  format = String,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label: string;
  format?: (value: number) => string;
}) {
  const button = (kind: "dec" | "inc") => {
    const disabled = kind === "dec" ? value <= min : value >= max;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${kind === "dec" ? "Diminuir" : "Aumentar"} ${label}`}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => onChange(kind === "dec" ? value - 1 : value + 1)}
        style={({ pressed }) => ({
          width: 48,
          height: 44,
          borderRadius: radius.sm,
          backgroundColor: colors.primarySoft,
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        })}
      >
        {kind === "dec" ? <Minus size={22} color={colors.ink} /> : <Plus size={22} color={colors.ink} />}
      </Pressable>
    );
  };
  return (
    <View
      accessible={false}
      style={{
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: 4,
        backgroundColor: colors.card,
      }}
    >
      {button("dec")}
      <AppText
        variant="h3"
        align="center"
        style={{ flex: 1 }}
        accessibilityLiveRegion="polite"
        accessibilityLabel={`${label}: ${format(value)}`}
      >
        {format(value)}
      </AppText>
      {button("inc")}
    </View>
  );
}

/** Linha com texto e interruptor (React Native Paper Switch). */
export function ToggleRow({
  title,
  description,
  value,
  onChange,
  icon,
  tone = "white",
}: {
  title: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  icon?: ReactNode;
  tone?: "white" | "soft" | "plain";
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={title}
      accessibilityHint={description}
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: tone === "plain" ? 0 : 16,
        borderRadius: radius.lg,
        backgroundColor: tone === "soft" ? colors.primarySoft : tone === "white" ? colors.card : "transparent",
        borderWidth: tone === "white" ? 1 : 0,
        borderColor: colors.border,
        minHeight: 56,
      }}
    >
      {icon}
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="label" weight="bold">
          {title}
        </AppText>
        {description ? (
          <AppText variant="caption" color={colors.muted}>
            {description}
          </AppText>
        ) : null}
      </View>
      <View pointerEvents="none" importantForAccessibility="no-hide-descendants">
        <Switch value={value} color={colors.accent} />
      </View>
    </Pressable>
  );
}

export function Checkbox({ checked, onChange, label, tone = "soft" }: { checked: boolean; onChange: (v: boolean) => void; label: string; tone?: "soft" | "plain" }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      onPress={() => onChange(!checked)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        padding: tone === "soft" ? 16 : 0,
        borderRadius: radius.lg,
        backgroundColor: tone === "soft" ? colors.primarySoft : "transparent",
        minHeight: 48,
      }}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 7,
          backgroundColor: checked ? colors.accent : colors.card,
          borderWidth: checked ? 0 : 1.5,
          borderColor: colors.borderStrong,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked ? <Check size={18} color={colors.white} strokeWidth={3} /> : null}
      </View>
      <AppText variant="label" weight="semibold" style={{ flex: 1 }}>
        {label}
      </AppText>
    </Pressable>
  );
}

/** Estrelas de avaliação; interactivas quando recebem `onChange`. */
export function RatingStars({ value, onChange, size = 36, showValue }: { value: number; onChange?: (v: number) => void; size?: number; showValue?: boolean }) {
  return (
    <View
      accessibilityRole={onChange ? "adjustable" : "text"}
      accessibilityLabel={`Avaliação: ${value} de 5 estrelas`}
      accessibilityValue={{ min: 0, max: 5, now: value }}
      onAccessibilityAction={(e) => {
        if (!onChange) return;
        if (e.nativeEvent.actionName === "increment") onChange(Math.min(5, value + 1));
        if (e.nativeEvent.actionName === "decrement") onChange(Math.max(1, value - 1));
      }}
      accessibilityActions={onChange ? [{ name: "increment" }, { name: "decrement" }] : undefined}
      style={{ flexDirection: "row", alignItems: "center", gap: onChange ? 14 : 2, justifyContent: onChange ? "center" : "flex-start" }}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const star = (
          <Star
            size={size}
            color={n <= value ? colors.star : onChange ? colors.accent : colors.borderStrong}
            fill={n <= value ? colors.star : "transparent"}
            strokeWidth={onChange ? 1.6 : 2}
          />
        );
        return onChange ? (
          <Pressable key={n} accessibilityRole="button" accessibilityLabel={`${n} estrela${n > 1 ? "s" : ""}`} hitSlop={6} onPress={() => onChange(n)}>
            {star}
          </Pressable>
        ) : (
          <View key={n}>{star}</View>
        );
      })}
      {showValue ? (
        <AppText variant="label" weight="bold" style={{ marginLeft: 6 }}>
          {value.toFixed(1).replace(".", ",")}
        </AppText>
      ) : null}
    </View>
  );
}
