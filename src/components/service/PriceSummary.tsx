import { View } from "react-native";
import type { PriceBreakdown } from "@/types/domain";
import { formatKz } from "@/utils/format";
import { colors } from "@/theme/colors";
import { AppText } from "@/components/core/AppText";
import { Divider } from "@/components/core/Card";

/** Decomposição do valor (ref. 10 recibo: valor do serviço, taxa e total). */
export function PriceSummary({ price, totalLabel = "Total", detailed = false }: { price: PriceBreakdown; totalLabel?: string; detailed?: boolean }) {
  const service = price.total - price.platformFee;
  const rows: [string, number][] = detailed
    ? [
        ["Valor base", price.base],
        ["Distância", price.distance],
        ...(price.extras ? ([["Extras e ajudantes", price.extras]] as [string, number][]) : []),
        ["Taxa de plataforma", price.platformFee],
      ]
    : [
        ["Valor do serviço", service],
        ["Taxa de plataforma", price.platformFee],
      ];
  return (
    <View style={{ gap: 10 }}>
      {rows.map(([label, value]) => (
        <View key={label} style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <AppText variant="body" color={colors.muted}>
            {label}
          </AppText>
          <AppText variant="body">{formatKz(value)}</AppText>
        </View>
      ))}
      <Divider />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <AppText variant="title">{totalLabel}</AppText>
        <AppText variant="title">{formatKz(price.total)}</AppText>
      </View>
    </View>
  );
}

/** Valor em destaque (ref. 20 "Estimativa 12 500 Kz", ref. 35 "Estimativa de ganho"). */
export function AmountHighlight({ label, amount, note, size = "lg" }: { label: string; amount: number; note?: string; size?: "lg" | "md" }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="label" weight="bold">
          {label}
        </AppText>
        <AppText weight="extrabold" color={colors.primary} style={{ fontSize: size === "lg" ? 40 : 30, lineHeight: size === "lg" ? 48 : 36, letterSpacing: -1 }}>
          {formatKz(amount)}
        </AppText>
      </View>
      {note ? (
        <AppText variant="tiny" color={colors.muted} style={{ maxWidth: 130 }}>
          {note}
        </AppText>
      ) : null}
    </View>
  );
}
