import { View } from "react-native";
import { colors } from "@/theme/colors";
import { AppText } from "@/components/core/AppText";
import { formatNumber } from "@/utils/format";

/** Gráfico de barras semanal (ref. 38). Barras em View: sem dependências de gráficos. */
export function EarningsChart({ values, labels, height = 160 }: { values: number[]; labels: string[]; height?: number }) {
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
      <View style={{ height, justifyContent: "space-between", paddingBottom: 22 }}>
        {ticks.map((t) => (
          <AppText key={t} variant="tiny" color={colors.subtle} style={{ lineHeight: 12 }}>
            {t === 0 ? "0" : `${Math.round(t / 1000)}K`}
          </AppText>
        ))}
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ height: height - 22, flexDirection: "row", alignItems: "flex-end", gap: 10, borderBottomWidth: 1, borderColor: colors.border }}>
          {values.map((v, i) => (
            <View
              key={labels[i]}
              style={{
                flex: 1,
                height: `${(v / top) * 100}%`,
                borderTopLeftRadius: 4,
                borderTopRightRadius: 4,
                backgroundColor: i === best ? colors.accent : "#3DB46F",
              }}
            />
          ))}
        </View>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 6 }}>
          {labels.map((l) => (
            <AppText key={l} variant="tiny" color={colors.muted} align="center" style={{ flex: 1 }}>
              {l}
            </AppText>
          ))}
        </View>
      </View>
    </View>
  );
}
