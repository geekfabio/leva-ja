import { View } from "react-native";
import { Landmark } from "lucide-react-native";
import type { Transaction } from "@/types/domain";
import { formatTime } from "@/utils/date";
import { formatSignedKz } from "@/utils/format";
import { colors, radius, shadow } from "@/theme/colors";
import { AppText } from "@/components/core/AppText";
import { IconCircle } from "@/components/core/Card";
import { ServiceIcon } from "@/components/service/ServiceIcon";
import { StatusBadge } from "@/components/service/StatusBadge";

const statusCopy = {
  completed: { label: "Concluído", tone: "success" as const },
  pending: { label: "Pendente", tone: "warning" as const },
  failed: { label: "Falhou", tone: "danger" as const },
};

/** Movimento da carteira (ref. 39). */
export function TransactionRow({ transaction }: { transaction: Transaction }) {
  const s = statusCopy[transaction.status];
  const positive = transaction.amount > 0;
  return (
    <View
      accessible
      accessibilityLabel={`${transaction.title}, ${formatSignedKz(transaction.amount)}, ${s.label}, ${formatTime(transaction.at)}`}
      style={[{ flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }, shadow.card]}
    >
      <IconCircle size={48}>
        {transaction.kind === "withdrawal" ? <Landmark size={24} color={colors.ink} /> : <ServiceIcon kind={transaction.serviceKind ?? "cargo"} size={24} />}
      </IconCircle>
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="label" weight="bold">
          {transaction.title}
        </AppText>
        <AppText variant="caption" color={colors.muted}>
          {formatTime(transaction.at)}
        </AppText>
      </View>
      <View style={{ alignItems: "flex-end", gap: 6 }}>
        <AppText variant="title" color={positive ? colors.primary : colors.danger}>
          {formatSignedKz(transaction.amount)}
        </AppText>
        <StatusBadge label={s.label} tone={s.tone} icon={transaction.status === "completed" ? "check" : "alert"} />
      </View>
    </View>
  );
}
