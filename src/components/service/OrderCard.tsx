import { Pressable, View } from "react-native";
import { ChevronRight, Coins, MapPin, Navigation2 } from "lucide-react-native";
import type { ServiceRequest } from "@/types/domain";
import { serviceTitle } from "@/features/booking/catalog";
import { describeLoad } from "@/features/booking/factory";
import { formatKm, formatKz } from "@/utils/format";
import { colors, radius, shadow } from "@/theme/colors";
import { AppText } from "@/components/core/AppText";
import { IconCircle } from "@/components/core/Card";
import { PrimaryButton } from "@/components/core/Buttons";
import { ServiceIcon } from "./ServiceIcon";
import { StatusBadge } from "./StatusBadge";

/**
 * Pedido visto pelo prestador. `full`: caixa de pedidos (ref. 37);
 * `row`: lista compacta do painel (ref. 34).
 */
export function OrderCard({
  request,
  distanceKm,
  onPress,
  variant = "full",
  badge,
}: {
  request: ServiceRequest;
  /** Distância do prestador até à recolha. */
  distanceKm: number;
  onPress: () => void;
  variant?: "full" | "row";
  badge?: { label: string; tone: "success" | "info" | "warning" | "neutral" };
}) {
  const label = `${serviceTitle[request.kind]}, ${request.origin.area}, ${formatKm(distanceKm)}, ${formatKz(request.providerEarning)}`;
  if (variant === "row")
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        style={({ pressed }) => [
          { flexDirection: "row", gap: 12, padding: 14, borderRadius: radius.lg, backgroundColor: pressed ? colors.primarySoft : colors.card, borderWidth: 1, borderColor: colors.border },
          shadow.card,
        ]}
      >
        <IconCircle size={46}>
          <ServiceIcon kind={request.kind} size={22} color={colors.deep} />
        </IconCircle>
        <View style={{ flex: 1, gap: 3 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
            <AppText variant="title" style={{ flexShrink: 1 }}>{serviceTitle[request.kind]}</AppText>
            <AppText variant="title" color={colors.primary}>
              {formatKz(request.providerEarning)}
            </AppText>
          </View>
          <AppText variant="caption" color={colors.muted}>
            {request.origin.area} · {formatKm(distanceKm)}
          </AppText>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <MapPin size={13} color={colors.muted} />
            <AppText variant="caption" color={colors.text} numberOfLines={1}>
              {request.origin.label}
            </AppText>
          </View>
          <View style={{ flexDirection: "row", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
            <Tag text={describeLoad(request)} />
            <Tag text={formatKm(request.distanceKm)} icon />
          </View>
        </View>
        <View style={{ justifyContent: "center" }}>
          <ChevronRight size={20} color={colors.text} />
        </View>
      </Pressable>
    );

  return (
    <View style={[{ borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, overflow: "hidden" }, shadow.card]}>
      <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => ({ padding: 16, gap: 10, backgroundColor: pressed ? "#F6FAF7" : colors.card })}>
        <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
          <IconCircle size={52} shape="rounded">
            <ServiceIcon kind={request.kind} size={28} color={colors.deep} />
          </IconCircle>
          <View style={{ flex: 1, gap: 2 }}>
            <AppText variant="h3">{serviceTitle[request.kind]}</AppText>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <MapPin size={14} color={colors.muted} />
              <AppText variant="caption" color={colors.muted}>
                {request.origin.area} · {formatKm(distanceKm)}
              </AppText>
            </View>
          </View>
          <StatusBadge label={badge?.label ?? "Novo"} tone={badge?.tone ?? "success"} />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ flex: 1, gap: 6, paddingLeft: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 3, borderColor: colors.accent }} />
              <AppText variant="caption">{request.origin.area}</AppText>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <MapPin size={13} color={colors.white} fill={colors.danger} />
              <AppText variant="caption">{request.destination.area}</AppText>
            </View>
          </View>
          <ChevronRight size={20} color={colors.subtle} />
        </View>
      </Pressable>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.primarySoft, paddingHorizontal: 16, paddingVertical: 10 }}>
        <Coins size={22} color={colors.primary} />
        <AppText variant="h3" style={{ flex: 1 }}>
          {formatKz(request.providerEarning)}
        </AppText>
        <PrimaryButton size="sm" label="Ver pedido" onPress={onPress} trailingIcon={<ChevronRight size={16} color={colors.white} />} />
      </View>
    </View>
  );
}

function Tag({ text, icon }: { text: string; icon?: boolean }) {
  if (!text) return null;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#F1F4F2", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, maxWidth: 200 }}>
      {icon ? <Navigation2 size={11} color={colors.text} /> : null}
      <AppText variant="tiny" numberOfLines={1}>
        {text}
      </AppText>
    </View>
  );
}
