import { useEffect, useState } from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors } from "@/theme/colors";
import { AppText } from "@/components/core/AppText";

/** Anel de contagem decrescente para aceitar um pedido (ref. 35). */
export function CountdownRing({ seconds, onExpire, size = 84, paused }: { seconds: number; onExpire: () => void; size?: number; paused?: boolean }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (paused) return;
    if (left <= 0) {
      onExpire();
      return;
    }
    const t = setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [left, paused, onExpire]);
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <View
      accessible
      accessibilityRole="timer"
      accessibilityLabel={`${left} segundos para responder`}
      style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}
    >
      <Svg width={size} height={size} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.border} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={left <= 10 ? colors.warningBright : colors.accent}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={c * (1 - left / seconds)}
          strokeLinecap="round"
        />
      </Svg>
      <AppText variant="h2" style={{ lineHeight: 26 }}>
        {left}
      </AppText>
      <AppText variant="tiny" color={colors.muted}>
        segundos
      </AppText>
    </View>
  );
}
