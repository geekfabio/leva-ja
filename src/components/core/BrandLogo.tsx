import { View } from "react-native";
import { Truck } from "lucide-react-native";
import { colors } from "@/theme/colors";
import { AppText } from "./AppText";

type Props = {
  inverse?: boolean;
  size?: "sm" | "md" | "lg";
  tagline?: string | false;
};

/** Marca "AngoLeva" com o símbolo de reboque e a linha "Reboque • Carga • Mudanças". */
export function BrandLogo({ inverse = false, size = "md", tagline = "Reboque • Carga • Mudanças" }: Props) {
  const fg = inverse ? colors.white : colors.ink;
  const accent = inverse ? "#7BE3A6" : colors.accent;
  const fontSize = { sm: 20, md: 26, lg: 44 }[size];
  return (
    <View accessible accessibilityRole="header" accessibilityLabel="AngoLeva">
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <View style={{ gap: 3 }}>
          {[14, 10, 6].map((w) => (
            <View key={w} style={{ width: w * (fontSize / 26), height: 3, borderRadius: 2, backgroundColor: accent, alignSelf: "flex-end" }} />
          ))}
        </View>
        <AppText weight="extrabold" color={fg} style={{ fontSize, lineHeight: fontSize * 1.15, letterSpacing: -0.5 }}>
          Ango
          <AppText weight="extrabold" color={accent} style={{ fontSize, lineHeight: fontSize * 1.15 }}>
            Leva
          </AppText>
        </AppText>
        {size !== "sm" ? <Truck size={fontSize * 0.8} color={accent} strokeWidth={2.4} /> : null}
      </View>
      {tagline ? (
        <AppText variant="tiny" color={inverse ? "#CDEBD9" : colors.muted} style={{ textTransform: "uppercase", letterSpacing: 1.2, marginTop: 1 }}>
          {tagline}
        </AppText>
      ) : null}
    </View>
  );
}
