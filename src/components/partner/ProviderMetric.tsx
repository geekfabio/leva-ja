import { ReactNode } from "react";
import {View} from "react-native";
import { ChevronRight } from "lucide-react-native";
import { colors, radius, shadow } from "@/theme/colors";
import { AppText } from "@/components/core/AppText";
import { IconCircle } from "@/components/core/Card";
import { ScalePressable } from "@/components/core/Motion";

/** Métrica do prestador (ref. 38: "Esta semana", "Hoje", "Serviços concluídos"). */
export function ProviderMetric({ icon, label, value, onPress }: { icon: ReactNode; label: string; value: string; onPress?: () => void }) {
  const content = (
    <View style={[{ flex: 1, flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }, shadow.card]}>
      <IconCircle size={38}>{icon}</IconCircle>
      <View style={{ flex: 1 }}>
        <AppText variant="caption" color={colors.text}>
          {label}
        </AppText>
        <AppText variant="h3" style={{ fontSize: 16 }} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </AppText>
      </View>
      {onPress ? <ChevronRight size={20} color={colors.text} /> : null}
    </View>
  );
  if (!onPress) return <View style={{ flex: 1 }} accessible accessibilityLabel={`${label}: ${value}`}>{content}</View>;
  return (
    <ScalePressable style={{ flex: 1 }} accessibilityRole="button" accessibilityLabel={`${label}: ${value}`} onPress={onPress}>
      {content}
    </ScalePressable>
  );
}
