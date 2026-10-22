import { ReactNode } from "react";
import {View} from "react-native";
import { ChevronRight } from "lucide-react-native";
import { colors, radius, shadow } from "@/theme/colors";
import { AppText } from "./AppText";
import { IconCircle } from "./Card";
import { ScalePressable } from "./Motion";

type Props = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  /** Valor à direita, ex.: "Português". */
  value?: string;
  right?: ReactNode;
  onPress?: () => void;
  tone?: "default" | "danger" | "primary" | "sos";
  /** card: cartão isolado (ref. 31, 33); plain: linha dentro de um grupo (ref. 32). */
  variant?: "card" | "plain";
  chevron?: boolean;
  accessibilityHint?: string;
};

export function ListRow({
  title,
  subtitle,
  icon,
  value,
  right,
  onPress,
  tone = "default",
  variant = "card",
  chevron = !!onPress,
  accessibilityHint,
}: Props) {
  const fg = tone === "danger" || tone === "sos" ? colors.danger : tone === "primary" ? colors.white : colors.ink;
  const bg =
    variant === "plain"
      ? "transparent"
      : tone === "primary"
        ? colors.primary
        : tone === "sos"
          ? colors.dangerSoft
          : tone === "danger"
            ? colors.dangerSoft
            : colors.card;
  const content = (pressed: boolean) => (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          minHeight: variant === "card" ? 72 : 60,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderRadius: variant === "card" ? radius.lg : 0,
          backgroundColor: pressed ? (tone === "primary" ? colors.primaryPressed : variant === "plain" ? "#F1F4F2" : colors.primarySoft) : bg,
          borderWidth: variant === "card" && tone === "danger" ? 1.5 : variant === "card" && tone === "default" ? 1 : 0,
          borderColor: tone === "danger" ? "#F4B4AE" : colors.border,
        },
        variant === "card" && tone === "default" ? shadow.card : null,
      ]}
    >
      {icon ? (
        variant === "card" && tone !== "danger" ? (
          <IconCircle tone={tone === "primary" ? "deep" : tone === "sos" ? "danger" : "soft"}>{icon}</IconCircle>
        ) : (
          icon
        )
      ) : null}
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant={variant === "card" ? "title" : "body"} weight={variant === "card" ? "bold" : "medium"} color={fg}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color={tone === "primary" ? "#D6F2E2" : colors.muted}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {value ? (
        <AppText variant="label" weight="medium" color={colors.muted}>
          {value}
        </AppText>
      ) : null}
      {right}
      {chevron ? <ChevronRight size={22} color={tone === "primary" ? colors.white : tone === "danger" || tone === "sos" ? colors.danger : colors.text} /> : null}
    </View>
  );
  if (!onPress) return content(false);
  return (
    <ScalePressable accessibilityRole="button" accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title} accessibilityHint={accessibilityHint} onPress={onPress}>
      {({ pressed }) => content(pressed)}
    </ScalePressable>
  );
}

/** Grupo de linhas "plain" num cartão branco com divisórias (ref. 32). */
export function ListGroup({ children }: { children: ReactNode }) {
  return (
    <View style={[{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: "hidden" }, shadow.card]}>
      {children}
    </View>
  );
}

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
      <AppText variant="h3" accessibilityRole="header">
        {title}
      </AppText>
      {action && onAction ? (
        <ScalePressable accessibilityRole="button" onPress={onAction} hitSlop={10}>
          <AppText variant="label" weight="bold" color={colors.primary}>
            {action}
          </AppText>
        </ScalePressable>
      ) : null}
    </View>
  );
}
