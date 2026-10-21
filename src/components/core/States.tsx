import { ReactNode, useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { AlertTriangle, Inbox } from "lucide-react-native";
import { colors, radius } from "@/theme/colors";
import { AppText } from "./AppText";
import { IconCircle } from "./Card";
import { PrimaryButton, SecondaryButton } from "./Buttons";

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View accessible accessibilityRole="summary" style={{ alignItems: "center", paddingVertical: 32, paddingHorizontal: 16, gap: 12 }}>
      <IconCircle size={72}>{icon ?? <Inbox size={32} color={colors.primary} />}</IconCircle>
      <AppText variant="h3" align="center">
        {title}
      </AppText>
      {description ? (
        <AppText variant="body" color={colors.muted} align="center">
          {description}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <View style={{ alignSelf: "stretch", marginTop: 8 }}>
          <SecondaryButton label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

export function ErrorState({ title = "Não foi possível carregar", description = "Verifica a ligação e tenta novamente.", onRetry }: { title?: string; description?: string; onRetry?: () => void }) {
  return (
    <View accessible accessibilityRole="alert" style={{ alignItems: "center", paddingVertical: 32, paddingHorizontal: 16, gap: 12 }}>
      <IconCircle size={72} tone="warning">
        <AlertTriangle size={32} color={colors.warning} />
      </IconCircle>
      <AppText variant="h3" align="center">
        {title}
      </AppText>
      <AppText variant="body" color={colors.muted} align="center">
        {description}
      </AppText>
      {onRetry ? (
        <View style={{ alignSelf: "stretch", marginTop: 8 }}>
          <PrimaryButton label="Tentar novamente" onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}

/** Esqueleto pulsante (Reanimated) enquanto a consulta simulada carrega. */
export function Skeleton({ height = 16, width = "100%", rounded = radius.sm }: { height?: number; width?: number | `${number}%`; rounded?: number }) {
  const opacity = useSharedValue(0.5);
  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 700 }), -1, true);
  }, [opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[{ height, width, borderRadius: rounded, backgroundColor: "#E6ECE8" }, style]} />;
}

export function LoadingState({ rows = 3, label = "A carregar" }: { rows?: number; label?: string }) {
  return (
    <View accessible accessibilityLabel={label} accessibilityState={{ busy: true }} style={{ gap: 12 }}>
      {Array.from({ length: rows }, (_, i) => (
        <View key={i} style={{ flexDirection: "row", gap: 14, padding: 16, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}>
          <Skeleton width={48} height={48} rounded={24} />
          <View style={{ flex: 1, gap: 8, justifyContent: "center" }}>
            <Skeleton width="60%" />
            <Skeleton width="85%" height={12} />
          </View>
        </View>
      ))}
    </View>
  );
}

/** Nota informativa (ref. 17 "Inclui ferramentas…", ref. 20 "Pagamento após confirmação"). */
export function InfoNote({ icon, title, children, tone = "muted" }: { icon?: ReactNode; title?: string; children: ReactNode; tone?: "muted" | "soft" | "warning" }) {
  const bg = { muted: "#F1F4F2", soft: colors.primarySoft, warning: colors.warningSoft }[tone];
  return (
    <View style={{ flexDirection: "row", gap: 12, padding: 16, borderRadius: radius.lg, backgroundColor: bg, alignItems: "flex-start" }}>
      {icon}
      <View style={{ flex: 1, gap: 2 }}>
        {title ? <AppText variant="label" weight="bold">{title}</AppText> : null}
        {typeof children === "string" ? (
          <AppText variant="caption" color={colors.muted}>
            {children}
          </AppText>
        ) : (
          children
        )}
      </View>
    </View>
  );
}
