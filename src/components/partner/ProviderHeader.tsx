import { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft, BadgeCheck, Bell, Car, ChevronRight } from "lucide-react-native";
import { useMyProvider } from "@/features/provider/useProvider";
import { colors, radius } from "@/theme/colors";
import { AppText } from "@/components/core/AppText";
import { Avatar } from "@/components/core/Avatar";
import { IconButton } from "@/components/core/IconButton";
import { VehicleImage } from "@/components/service/Media";
import { useNotifications } from "@/features/notifications/useNotifications";

const notify = () => router.push("/alerts" as never);

/** Sino com indicação de notificações por ler. */
export function NotificationBell({ inverse = false }: { inverse?: boolean }) {
  const { unread } = useNotifications("provider");
  return <IconButton label={unread ? `Notificações, ${unread} por ler` : "Notificações"} badge={unread > 0} icon={<Bell size={24} color={inverse ? colors.white : colors.ink} />} onPress={notify} />;
}

/** Cabeçalho verde-escuro com o prestador e a viatura (ref. 39, 40, 43, 45). */
export function ProviderHeader({ title, back, right, onPress }: { title?: string; back?: boolean; right?: ReactNode; onPress?: () => void }) {
  const me = useMyProvider();
  const vehicle = me.vehicle;
  return (
    <SafeAreaView edges={["top"]} style={{ backgroundColor: colors.deep, paddingHorizontal: 12, paddingBottom: 18, paddingTop: 4 }}>
      {title ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, minHeight: 52 }}>
          {back ? <IconButton label="Voltar" icon={<ArrowLeft size={24} color={colors.white} />} onPress={() => router.back()} /> : null}
          <AppText variant="h2" color={colors.white} accessibilityRole="header" style={{ flex: 1 }}>
            {title}
          </AppText>
          {right}
        </View>
      ) : (
        <Pressable accessibilityRole={onPress ? "button" : undefined} accessibilityLabel={`${me.name}, prestador verificado`} onPress={onPress} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 8, paddingTop: 6 }}>
          {back ? <IconButton label="Voltar" icon={<ArrowLeft size={24} color={colors.white} />} onPress={() => router.back()} /> : null}
          <Avatar name={me.name} initials={me.initials} photo={me.avatar} size={60} verified />
          <View style={{ flex: 1 }}>
            <AppText variant="h3" color={colors.white}>
              {me.name}
            </AppText>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <BadgeCheck size={15} color={colors.deep} fill="#7BE3A6" />
              <AppText variant="caption" color="#B9E8CC">
                Prestador verificado
              </AppText>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Car size={14} color="#D3EFDF" />
              <AppText variant="caption" color="#D3EFDF" numberOfLines={1} style={{ flexShrink: 1 }}>
                {vehicle.brand} {vehicle.model} • {vehicle.plate}
              </AppText>
            </View>
          </View>
          {right ?? <NotificationBell inverse />}
          {onPress ? <ChevronRight size={22} color={colors.white} /> : null}
        </Pressable>
      )}
    </SafeAreaView>
  );
}

/** Cartão suave com o prestador e a viatura (ref. 37, 38, 42, 44). */
export function ProviderSummaryCard({ right, showVehicleImage = false, onPress }: { right?: ReactNode; showVehicleImage?: boolean; onPress?: () => void }) {
  const me = useMyProvider();
  const vehicle = me.vehicle;
  const content = (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: radius.lg, backgroundColor: colors.primarySoft }}>
      {showVehicleImage ? <VehicleImage art="pickup" width={84} height={56} /> : <Avatar name={me.name} initials={me.initials} photo={me.avatar} size={right ? 52 : 60} verified />}
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <AppText variant={right ? "title" : "h3"} numberOfLines={1} style={{ flexShrink: 1 }}>
            {me.name}
          </AppText>
          {showVehicleImage ? <BadgeCheck size={18} color={colors.white} fill={colors.accent} /> : null}
        </View>
        <AppText variant="caption" color={colors.muted}>
          Prestador verificado
        </AppText>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <Car size={15} color={colors.ink} />
          {right ? null : (
            <AppText variant="caption">
              {vehicle.brand} {vehicle.model}
            </AppText>
          )}
          <View style={{ backgroundColor: colors.card, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 }}>
            <AppText variant="tiny" weight="bold">
              {vehicle.plate}
            </AppText>
          </View>
        </View>
      </View>
      {right}
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${me.name}, ver perfil`} onPress={onPress}>
      {content}
    </Pressable>
  );
}

export const notifyProvider = notify;
