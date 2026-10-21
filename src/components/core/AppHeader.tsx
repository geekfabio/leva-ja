import { ReactNode } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { colors } from "@/theme/colors";
import { AppText } from "./AppText";
import { BrandLogo } from "./BrandLogo";
import { IconButton } from "./IconButton";
import { StepProgress } from "./StepProgress";

type Props = {
  title?: string;
  /** Mostra a marca Leva Já no centro ou à esquerda. */
  brand?: boolean;
  back?: boolean | (() => void);
  right?: ReactNode;
  step?: { current: number; total: number };
  variant?: "plain" | "green" | "deep";
  align?: "left" | "center";
};

/** Cabeçalho: voltar, título ou marca, progresso de passos e acção à direita. */
export function AppHeader({
  title,
  brand,
  back = true,
  right,
  step,
  variant = "plain",
  align = "left",
}: Props) {
  const inverse = variant !== "plain";
  const fg = inverse ? colors.white : colors.ink;
  const goBack = () => {
    if (typeof back === "function") return back();
    if (router.canGoBack()) router.back();
  };
  return (
    <View
      style={{
        backgroundColor: variant === "green" ? colors.primary : variant === "deep" ? colors.deep : "transparent",
        paddingHorizontal: 12,
        paddingVertical: 8,
        minHeight: 60,
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
      }}
    >
      {back ? (
        <IconButton label="Voltar" onPress={goBack} icon={<ArrowLeft size={24} color={fg} />} />
      ) : (
        <View style={{ width: 8 }} />
      )}
      <View style={{ flex: 1, alignItems: align === "center" ? "center" : "flex-start", paddingHorizontal: 4 }}>
        {brand ? (
          <BrandLogo size="sm" inverse={inverse} tagline={step ? false : undefined} />
        ) : title ? (
          <AppText variant="h3" color={fg} accessibilityRole="header" numberOfLines={1}>
            {title}
          </AppText>
        ) : null}
      </View>
      {step ? <StepProgress current={step.current} total={step.total} /> : null}
      {right ? <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>{right}</View> : null}
      {!step && !right && align === "center" ? <View style={{ width: 44 }} /> : null}
    </View>
  );
}

/** Título grande de ecrã com subtítulo (ex.: "Qual é o problema?"). */
export function ScreenTitle({ title, subtitle, size = "h1" }: { title: string; subtitle?: string; size?: "display" | "h1" | "h2" }) {
  return (
    <View style={{ gap: 6 }}>
      <AppText variant={size} accessibilityRole="header">
        {title}
      </AppText>
      {subtitle ? (
        <AppText variant="body" color={colors.muted}>
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}
