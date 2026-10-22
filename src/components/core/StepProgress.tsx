import { useEffect } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from "react-native-reanimated";
import { colors } from "@/theme/colors";
import { AppText } from "./AppText";
import { motion, useMotionEnabled } from "./Motion";

/** Barra que se preenche ao entrar no passo. */
function ProgressBar({ filled, delay }: { filled: boolean; delay: number }) {
  const enabled = useMotionEnabled();
  const width = useSharedValue(enabled ? 0 : filled ? 1 : 0);
  useEffect(() => {
    const to = filled ? 1 : 0;
    width.value = enabled ? withDelay(delay, withTiming(to, { duration: motion.slow, easing: motion.easeOut })) : to;
  }, [filled, enabled, width, delay]);
  const fill = useAnimatedStyle(() => ({ width: `${width.value * 100}%` }));
  return (
    <View style={{ width: 34, height: 5, borderRadius: 3, backgroundColor: colors.border, overflow: "hidden" }}>
      <Animated.View style={[{ height: 5, borderRadius: 3, backgroundColor: colors.accent }, fill]} />
    </View>
  );
}

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
        <ProgressBar key={i} filled={i < current} delay={i * 80} />
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

function Dot({ active }: { active: boolean }) {
  const enabled = useMotionEnabled();
  const progress = useSharedValue(active ? 1 : 0);
  useEffect(() => {
    progress.value = enabled ? withSpring(active ? 1 : 0, motion.spring) : active ? 1 : 0;
  }, [active, enabled, progress]);
  const style = useAnimatedStyle(() => ({
    width: 9 + progress.value * 15,
    backgroundColor: progress.value > 0.5 ? colors.accent : colors.borderStrong,
  }));
  return <Animated.View style={[{ height: 9, borderRadius: 5 }, style]} />;
}

/** Pontos do onboarding e do carrossel de procura: o activo alarga-se em pílula. */
export function DotsIndicator({ count, active }: { count: number; active: number }) {
  return (
    <View accessible accessibilityLabel={`Página ${active + 1} de ${count}`} style={{ flexDirection: "row", gap: 8, justifyContent: "center", alignItems: "center" }}>
      {Array.from({ length: count }, (_, i) => (
        <Dot key={i} active={i === active} />
      ))}
    </View>
  );
}
