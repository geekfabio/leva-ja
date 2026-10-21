import { View } from "react-native";
import { colors } from "@/theme/colors";
import { AppText } from "./AppText";

/** Barras de progresso "2 de 4" usadas nos formulários (ref. 07, 13–15). */
export function StepProgress({
  current,
  total,
  showLabel = true,
  labelPosition = "end",
}: {
  current: number;
  total: number;
  showLabel?: boolean;
  labelPosition?: "end" | "top";
}) {
  const label = `${current} de ${total}`;
  const bars = (
    <View style={{ flexDirection: "row", gap: 6 }}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={{
            width: 34,
            height: 5,
            borderRadius: 3,
            backgroundColor: i < current ? colors.accent : colors.border,
          }}
        />
      ))}
    </View>
  );
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`Passo ${label}`}
      accessibilityValue={{ min: 0, max: total, now: current }}
      style={{ alignItems: labelPosition === "top" ? "center" : "flex-end", gap: 6 }}
    >
      {showLabel && labelPosition === "top" ? <AppText variant="label">{label}</AppText> : null}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        {bars}
        {showLabel && labelPosition === "end" ? <AppText variant="label">{label}</AppText> : null}
      </View>
    </View>
  );
}

/** Pontos do onboarding e do carrossel de procura. */
export function DotsIndicator({ count, active }: { count: number; active: number }) {
  return (
    <View
      accessible
      accessibilityLabel={`Página ${active + 1} de ${count}`}
      style={{ flexDirection: "row", gap: 10, justifyContent: "center" }}
    >
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          style={{
            width: i === active ? 12 : 9,
            height: i === active ? 12 : 9,
            borderRadius: 6,
            backgroundColor: i === active ? colors.accent : colors.borderStrong,
          }}
        />
      ))}
    </View>
  );
}
