import { View } from "react-native";
import { AlertCircle, Check } from "lucide-react-native";
import type { ServiceStatus } from "@/types/domain";
import { statusLabel, statusTone, type StatusTone } from "@/features/service/stateMachine";
import { colors } from "@/theme/colors";
import { AppText } from "@/components/core/AppText";

const tones: Record<StatusTone, { bg: string; fg: string }> = {
  success: { bg: colors.primarySoft, fg: colors.primary },
  warning: { bg: colors.warningSoft, fg: colors.warning },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
  info: { bg: colors.infoSoft, fg: colors.info },
  neutral: { bg: "#EEF1EF", fg: "#53635A" },
};

/** Etiqueta de estado com texto (nunca só cor). */
export function StatusBadge({
  label,
  tone = "success",
  icon,
  status,
}: {
  label?: string;
  tone?: StatusTone;
  icon?: "check" | "alert";
  /** Atalho: usa a etiqueta e o tom do estado do serviço. */
  status?: ServiceStatus;
}) {
  const t = tones[status ? statusTone[status] : tone];
  const text = label ?? (status ? (status === "rated" || status === "paid" ? "Concluído" : statusLabel[status]) : "");
  return (
    <View
      accessible
      accessibilityLabel={`Estado: ${text}`}
      style={{ flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", backgroundColor: t.bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}
    >
      {icon === "check" ? <Check size={13} color={t.fg} strokeWidth={3} /> : null}
      {icon === "alert" ? <AlertCircle size={13} color={t.fg} strokeWidth={2.5} /> : null}
      <AppText variant="tiny" weight="bold" color={t.fg}>
        {text}
      </AppText>
    </View>
  );
}
