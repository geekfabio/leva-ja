import { Pressable, View } from "react-native";
import { colors, radius } from "@/theme/colors";
import { AppText } from "./AppText";

type Option<T extends string> = { value: T; label: string; dot?: boolean };

/** Filtros em pílula (ref. 37, 39) ou segmentos (ref. 17 "Sim/Não", ref. 40). */
export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
  variant = "pills",
}: {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  variant?: "pills" | "segmented";
}) {
  const segmented = variant === "segmented";
  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: "row",
        gap: segmented ? 0 : 8,
        backgroundColor: segmented ? "#F1F4F2" : "transparent",
        borderRadius: radius.md,
        padding: segmented ? 4 : 0,
        flexWrap: segmented ? "nowrap" : "wrap",
      }}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option.label}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => ({
              flex: segmented ? 1 : undefined,
              minHeight: 44,
              paddingHorizontal: 18,
              borderRadius: segmented ? radius.sm : radius.md,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 6,
              backgroundColor: active ? colors.primary : segmented ? "transparent" : "#EEF2EF",
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <AppText variant="label" color={active ? colors.white : colors.text}>
              {option.label}
            </AppText>
            {option.dot ? <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: active ? colors.white : colors.accent }} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}
