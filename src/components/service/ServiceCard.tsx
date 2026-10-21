import { Pressable, View } from "react-native";
import { ArrowRight, ChevronRight } from "lucide-react-native";
import type { ServiceDefinition } from "@/features/booking/catalog";
import { serviceShortTitle, serviceTitle } from "@/features/booking/catalog";
import type { ServiceRequest } from "@/types/domain";
import { formatShortDateTime } from "@/utils/date";
import { colors, radius, shadow } from "@/theme/colors";
import { AppText } from "@/components/core/AppText";
import { IconCircle } from "@/components/core/Card";
import { ServiceIcon } from "./ServiceIcon";
import { StatusBadge } from "./StatusBadge";
import { VehicleImage } from "./Media";

/** Linha do catálogo "O que precisas transportar?" (ref. 12). */
export function ServiceCatalogCard({ service, onPress }: { service: ServiceDefinition; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${service.title}. ${service.description}`}
      onPress={onPress}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
          padding: 16,
          minHeight: 104,
          borderRadius: radius.lg,
          backgroundColor: pressed ? colors.primarySoft : colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        },
        shadow.card,
      ]}
    >
      <IconCircle size={64}>
        <ServiceIcon kind={service.kind} variant={service.icon} size={34} color={colors.deep} strokeWidth={1.8} />
      </IconCircle>
      <View style={{ flex: 1, gap: 4 }}>
        <AppText variant="h3">{service.title}</AppText>
        <AppText variant="caption" color={colors.muted}>
          {service.description}
        </AppText>
      </View>
      <ChevronRight size={22} color={colors.text} />
    </Pressable>
  );
}

/** Mosaico com ilustração 3D no início do cliente (ref. 11). */
export function ServiceTile({ service, onPress }: { service: ServiceDefinition; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={service.title}
      onPress={onPress}
      style={({ pressed }) => [
        {
          flex: 1,
          minWidth: 96,
          borderRadius: radius.lg,
          backgroundColor: pressed ? colors.primarySoft : colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 10,
          gap: 6,
        },
        shadow.card,
      ]}
    >
      <View style={{ alignItems: "center", height: 64, justifyContent: "center" }}>
        <VehicleImage art={service.art} width={92} height={60} label={service.title} />
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
        <AppText variant="caption" weight="bold" numberOfLines={2} style={{ flexShrink: 1 }}>
          {service.shortTitle}
        </AppText>
        <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" }}>
          <ChevronRight size={14} color={colors.primary} strokeWidth={3} />
        </View>
      </View>
    </Pressable>
  );
}

/** Serviço recente ou do histórico (ref. 11 "Serviços recentes"). */
export function ServiceCard({ request, onPress, compact }: { request: ServiceRequest; onPress?: () => void; compact?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${serviceTitle[request.kind]}, ${request.origin.area} para ${request.destination.area}`}
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          padding: compact ? 12 : 14,
          borderRadius: radius.lg,
          backgroundColor: pressed ? colors.primarySoft : colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        },
        shadow.card,
      ]}
    >
      <IconCircle size={48}>
        <ServiceIcon kind={request.kind} size={24} color={colors.ink} />
      </IconCircle>
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="title">{serviceShortTitle[request.kind]}</AppText>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <AppText variant="caption" color={colors.muted}>
            {request.origin.area}
          </AppText>
          <ArrowRight size={12} color={colors.muted} />
          <AppText variant="caption" color={colors.muted}>
            {request.destination.area}
          </AppText>
        </View>
        <AppText variant="tiny" color={colors.subtle}>
          {formatShortDateTime(request.createdAt)}
        </AppText>
      </View>
      <StatusBadge status={request.status} />
      {onPress ? <ChevronRight size={20} color={colors.text} /> : null}
    </Pressable>
  );
}
