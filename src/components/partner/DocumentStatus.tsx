import {View} from "react-native";
import { AlertCircle, CarFront, ChevronRight, IdCard, ShieldCheck, UserRound } from "lucide-react-native";
import type { DocumentState, ProviderDocument } from "@/types/domain";
import { formatDate } from "@/utils/date";
import { colors, radius, shadow } from "@/theme/colors";
import { AppText } from "@/components/core/AppText";
import { IconCircle } from "@/components/core/Card";
import { StatusBadge } from "@/components/service/StatusBadge";
import { ScalePressable } from "@/components/core/Motion";

const stateCopy: Record<DocumentState, { label: string; tone: "success" | "warning" | "danger" | "info" }> = {
  verified: { label: "Verificado", tone: "success" },
  pending: { label: "Em análise", tone: "info" },
  needs_update: { label: "A actualizar", tone: "warning" },
  expired: { label: "Expirado", tone: "danger" },
};

const icons = { license: IdCard, id: UserRound, vehicle: CarFront, insurance: ShieldCheck };

/** Documento do prestador com validade e estado de validação (ref. 43). */
export function DocumentStatus({ document, onPress, selected }: { document: ProviderDocument; onPress?: () => void; selected?: boolean }) {
  const Icon = icons[document.icon];
  const state = stateCopy[document.state];
  return (
    <ScalePressable
      accessibilityRole="button"
      accessibilityLabel={`${document.title}, ${state.label}, válido até ${formatDate(document.validUntil)}`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          padding: 16,
          borderRadius: radius.lg,
          backgroundColor: pressed ? colors.primarySoft : colors.card,
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? colors.accent : colors.border,
        },
        shadow.card,
      ]}
    >
      <IconCircle size={48} shape="rounded" tone={document.state === "verified" ? "soft" : "warning"}>
        <Icon size={24} color={colors.ink} />
      </IconCircle>
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="title">{document.title}</AppText>
        <AppText variant="caption" color={colors.muted}>
          Válido até {formatDate(document.validUntil)}
        </AppText>
        <View style={{ marginTop: 4 }}>
          <StatusBadge label={state.label} tone={state.tone} icon={document.state === "verified" ? "check" : "alert"} />
        </View>
      </View>
      <ChevronRight size={20} color={colors.text} />
    </ScalePressable>
  );
}

export function AccountStatusCard({ documents }: { documents: ProviderDocument[] }) {
  const allVerified = documents.every((d) => d.state === "verified");
  const pending = documents.filter((d) => d.state !== "verified").length;
  return (
    <View style={{ flexDirection: "row", gap: 14, padding: 18, borderRadius: radius.lg, backgroundColor: colors.primarySoft }}>
      <IconCircle size={52} tone="white">
        {allVerified || pending <= 1 ? <ShieldCheck size={28} color={colors.primary} /> : <AlertCircle size={28} color={colors.warning} />}
      </IconCircle>
      <View style={{ flex: 1, gap: 4 }}>
        <AppText variant="caption">Estado da conta</AppText>
        <AppText variant="h2" color={colors.primary}>
          {pending > 1 ? "Em revisão" : "Verificado"}
        </AppText>
        <AppText variant="caption" color={colors.muted}>
          {pending === 0
            ? "Os seus documentos foram validados e a sua conta está activa para receber pedidos."
            : `A conta está activa. ${pending === 1 ? "Há 1 documento" : `Há ${pending} documentos`} para actualizar.`}
        </AppText>
      </View>
    </View>
  );
}
