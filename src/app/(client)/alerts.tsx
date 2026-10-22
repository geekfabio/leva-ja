import { View } from "react-native";
import { Bell, CircleUser, Megaphone, Truck, Wallet } from "lucide-react-native";
import { AppHeader, AppText, Appear, EmptyState, IconCircle, ScalePressable, ScreenContainer, TextButton } from "@/components/kit";
import { useNotifications } from "@/features/notifications/useNotifications";
import type { AppNotification } from "@/features/notifications/build";
import { useAccountStore } from "@/stores/useAccountStore";
import { dayGroupLabel, formatTime } from "@/utils/date";
import { go } from "@/features/navigation";
import { colors, radius } from "@/theme/colors";

const icons = { service: Truck, payment: Wallet, account: CircleUser, promo: Megaphone };

/** Notificações do cliente ou do prestador (simuladas a partir dos dados mockados). */
export default function AlertsScreen() {
  const { items, unread } = useNotifications();
  const markRead = useAccountStore((s) => s.markNotificationsRead);
  const groups = items.reduce<{ label: string; items: (AppNotification & { unread: boolean })[] }[]>((acc, n) => {
    const label = dayGroupLabel(n.at);
    const last = acc[acc.length - 1];
    if (last?.label === label) last.items.push(n);
    else acc.push({ label, items: [n] });
    return acc;
  }, []);
  let index = 0;
  return (
    <ScreenContainer
      header={<AppHeader title="Notificações" right={unread ? <TextButton size="sm" label="Marcar como lidas" onPress={() => markRead(items.map((n) => n.id))} /> : undefined} />}
      gap={10}
    >
      {!items.length ? <EmptyState icon={<Bell size={32} color={colors.primary} />} title="Sem notificações" description="Os avisos sobre os teus serviços aparecem aqui." /> : null}
      {groups.map((g) => (
        <View key={g.label} style={{ gap: 8 }}>
          <AppText variant="label" color={colors.muted} style={{ marginTop: 6 }}>
            {g.label}
          </AppText>
          {g.items.map((n) => {
            const Icon = icons[n.kind];
            return (
              <Appear key={n.id} index={index++}>
                <ScalePressable
                  accessibilityRole="button"
                  accessibilityLabel={`${n.unread ? "Não lida. " : ""}${n.title}. ${n.body}`}
                  onPress={() => {
                    markRead([n.id]);
                    if (n.href) go(n.href);
                  }}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    gap: 12,
                    padding: 14,
                    borderRadius: radius.lg,
                    borderWidth: 1,
                    borderColor: n.unread ? colors.primaryTint : colors.border,
                    backgroundColor: pressed ? colors.primarySoft : n.unread ? "#F3FBF6" : colors.card,
                  })}
                >
                  <IconCircle size={44}>
                    <Icon size={22} color={colors.primary} />
                  </IconCircle>
                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <AppText variant="label" weight="bold" style={{ flex: 1 }}>
                        {n.title}
                      </AppText>
                      <AppText variant="tiny" color={colors.muted}>
                        {formatTime(n.at)}
                      </AppText>
                    </View>
                    <AppText variant="caption" color={colors.text}>
                      {n.body}
                    </AppText>
                  </View>
                  {n.unread ? <View accessibilityElementsHidden style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: colors.accent, marginTop: 6 }} /> : null}
                </ScalePressable>
              </Appear>
            );
          })}
        </View>
      ))}
    </ScreenContainer>
  );
}
