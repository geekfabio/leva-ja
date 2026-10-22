import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";
import { useMotionEnabled } from "@/components/core/Motion";
import { colors } from "@/theme/colors";
import { AppText } from "@/components/core/AppText";
import { formatNumber } from "@/utils/format";

/** Barra que cresce a partir da base, em sequência. */
function Bar({
  ratio,
  index,
  highlight,
}: {
  ratio: number;
  index: number;
  highlight: boolean;
}) {
  const enabled = useMotionEnabled();
  const h = useSharedValue(enabled ? 0 : ratio);
  useEffect(() => {
    h.value = enabled
      ? withDelay(
          index * 60,
          withSpring(ratio, { damping: 14, stiffness: 120 }),
        )
      : ratio;
  }, [ratio, index, enabled, h]);
  const style = useAnimatedStyle(() => ({
    height: `${Math.max(0, h.value) * 100}%`,
  }));
  return (
    <View style={{ flex: 1, height: "100%", justifyContent: "flex-end" }}>
      <Animated.View
        style={[
          {
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
            backgroundColor: highlight ? colors.accent : "#3DB46F",
          },
          style,
        ]}
      />
    </View>
  );
}

/** Gráfico de barras semanal (ref. 38). Barras em View: sem dependências de gráficos. */
export function EarningsChart({
  values,
  labels,
  height = 160,
}: {
  values: number[];
  labels: string[];
  height?: number;
}) {
  const max = Math.max(...values, 1);
  const top = Math.ceil(max / 30000) * 30000;
  const ticks = [top, (top * 3) / 4, top / 2, top / 4, 0];
  const best = values.indexOf(max);
  return (
    <View
      accessible
      accessibilityLabel={`Ganhos da semana: ${values.map((v, i) => `${labels[i]} ${formatNumber(v)} kwanzas`).join(", ")}`}
      style={{ flexDirection: "row", gap: 8 }}
    >
      <View
        style={{ height, justifyContent: "space-between", paddingBottom: 22 }}
      >
        {ticks.map((t) => (
          <AppText
            key={t}
            variant="tiny"
            color={colors.subtle}
            style={{ lineHeight: 12 }}
          >
            {t === 0 ? "0" : `${Math.round(t / 1000)}K`}
          </AppText>
        ))}
      </View>
      <View style={{ flex: 1 }}>
        <View
          style={{
            height: height - 22,
            flexDirection: "row",
            alignItems: "flex-end",
            gap: 10,
            borderBottomWidth: 1,
            borderColor: colors.border,
          }}
        >
          {values.map((v, i) => (
            <Bar
              key={labels[i]}
              ratio={v / top}
              index={i}
              highlight={i === best}
            />
          ))}
        </View>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 6 }}>
          {labels.map((l) => (
            <AppText
              key={l}
              variant="tiny"
              color={colors.muted}
              align="center"
              style={{ flex: 1 }}
            >
              {l}
            </AppText>
          ))}
        </View>
      </View>
    </View>
  );
}
