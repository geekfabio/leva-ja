import { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, { cancelAnimation, Easing, useAnimatedProps, useSharedValue, withTiming } from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { colors } from "@/theme/colors";
import { AppText } from "@/components/core/AppText";
import { useBump } from "@/components/core/Motion";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** Anel de contagem decrescente para aceitar um pedido (ref. 35), a esvaziar de forma contínua. */
export function CountdownRing({ seconds, onExpire, size = 84, paused }: { seconds: number; onExpire: () => void; size?: number; paused?: boolean }) {
  const [left, setLeft] = useState(seconds);
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const remaining = useSharedValue(1);

  useEffect(() => {
    if (paused) {
      cancelAnimation(remaining);
      return;
    }
    remaining.value = withTiming(0, { duration: left * 1000, easing: Easing.linear });
    // Só reinicia quando pausa/retoma; o segundo actual é lido no momento.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, remaining]);

  useEffect(() => {
    if (paused) return;
    if (left <= 0) {
      onExpire();
      return;
    }
    const t = setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [left, paused, onExpire]);

  const props = useAnimatedProps(() => ({ strokeDashoffset: c * (1 - remaining.value) }));
  const bump = useBump(left <= 10 ? left : 0);

  return (
    <View accessible accessibilityRole="timer" accessibilityLabel={`${left} segundos para responder`} style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.border} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={left <= 10 ? colors.warningBright : colors.accent}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${c} ${c}`}
          strokeLinecap="round"
          animatedProps={props}
        />
      </Svg>
      <Animated.View style={bump}>
        <AppText variant="h2" style={{ lineHeight: 26 }}>
          {left}
        </AppText>
      </Animated.View>
      <AppText variant="tiny" color={colors.muted}>
        segundos
      </AppText>
    </View>
  );
}
