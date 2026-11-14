import { useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { CalendarDays, ChartColumn, ChevronDown, CircleAlert, FileText, Gift, List, Settings, Wallet } from "lucide-react-native";
import { AppText, BrandLogo, Card, EarningsChart, ErrorState, IconButton, IconCircle, InfoNote, LoadingState, ProviderMetric, ScreenContainer, SecondaryButton, SheetModal, Skeleton, AnimatedAmount } from "@/components/kit";
import { NotificationBell, ProviderSummaryCard } from "@/components/partner/ProviderHeader";
import { useCashBalance, useFinanceSummary } from "@/services/queries";
import { formatMonthYear } from "@/utils/date";
import { formatKz } from "@/utils/format";
import { go } from "@/features/navigation";
import { toast } from "@/lib/toast";
import { colors, radius } from "@/theme/colors";

const weekLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

/**
 * 38 · Ganhos: gráfico semanal, métricas e contas com a plataforma. O prestador
 * recebe em numerário, por isso aqui só vê quanto fez; não há levantamentos.
 */
export default function EarningsScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useFinanceSummary();
  const { data: cashBalance } = useCashBalance();
  const monthSheet = useRef<BottomSheetModal>(null);
  const months = Array.from({ length: 4 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return formatMonthYear(d);
  });
  const [month, setMonth] = useState(months[0]!);
  // Positivo: a plataforma deve ao prestador (bónus, descontos que ela assume). Negativo: o prestador deve taxas.
  const owing = cashBalance ? Math.max(0, -cashBalance.balanceKz) : 0;
  const credit = cashBalance ? Math.max(0, cashBalance.balanceKz) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView edges={["top"]} style={{ paddingHorizontal: 20, paddingTop: 6, flexDirection: "row", alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <BrandLogo size="md" tagline="Serviços de reboque, carga e mudanças em Luanda" />
        </View>
        <NotificationBell />
        <IconButton label="Definições" icon={<Settings size={24} color={colors.ink} />} onPress={() => go("/settings")} />
      </SafeAreaView>
      <ScreenContainer edges={[]} gap={12} refreshing={isRefetching} onRefresh={refetch} contentStyle={{ paddingTop: 10 }}>
        <ProviderSummaryCard showVehicleImage onPress={() => go("/partner/profile")} />
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <AppText variant="display" accessibilityRole="header" style={{ fontSize: 32 }}>
            Ganhos
          </AppText>
          <Pressable accessibilityRole="button" accessibilityLabel={`Período: ${month}. Alterar`} onPress={() => monthSheet.current?.present()} style={{ flexDirection: "row", alignItems: "center", gap: 4, minHeight: 44 }}>
            <AppText variant="label">{month}</AppText>
            <ChevronDown size={18} color={colors.ink} />
          </Pressable>
        </View>
        {isLoading ? (
          <>
            <Skeleton height={180} rounded={radius.lg} />
            <LoadingState rows={2} />
          </>
        ) : isError || !data ? (
          <ErrorState onRetry={refetch} />
        ) : (
          <>
            <Card>
              <EarningsChart values={data.chart} labels={weekLabels} />
            </Card>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <ProviderMetric icon={<ChartColumn size={22} color={colors.primary} />} label="Esta semana" value={formatKz(data.week)} />
              <ProviderMetric icon={<CalendarDays size={22} color={colors.primary} />} label="Hoje" value={formatKz(data.today)} />
            </View>
            <ProviderMetric icon={<FileText size={22} color={colors.primary} />} label="Serviços concluídos" value={String(data.completed)} onPress={() => go("/partner/history")} />
            <View style={{ backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: 16, gap: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                <IconCircle size={64} tone="white">
                  <Wallet size={30} color={colors.ink} />
                </IconCircle>
                <View style={{ flex: 1 }} accessible accessibilityLabel={`Ganhos desta semana: ${formatKz(data.week)}, recebidos em numerário`}>
                  <AppText variant="body">Ganhos desta semana</AppText>
                  <AnimatedAmount value={data.week} weight="extrabold" style={{ fontSize: 32, lineHeight: 40 }} />
                  <AppText variant="caption" color={colors.muted}>
                    Recebes em numerário, directamente do cliente.
                  </AppText>
                </View>
              </View>
              <SecondaryButton size="md" label="Ver transacções" icon={<List size={20} color={colors.primary} />} onPress={() => go("/partner/transactions")} />
            </View>
            {cashBalance && cashBalance.bonusKz > 0 ? (
              <Card style={{ flexDirection: "row", alignItems: "center", gap: 12 }} accessibilityLabel={`Bónus da AngoLeva: ${formatKz(cashBalance.bonusKz)}`}>
                <IconCircle size={48}>
                  <Gift size={24} color={colors.primary} />
                </IconCircle>
                <View style={{ flex: 1 }}>
                  <AppText variant="label" weight="bold">
                    Bónus da AngoLeva
                  </AppText>
                  <AppText variant="caption" color={colors.muted}>
                    Somado por cada corrida entregue.
                  </AppText>
                </View>
                <AppText variant="title" color={colors.primary}>
                  {formatKz(cashBalance.bonusKz)}
                </AppText>
              </Card>
            ) : null}
            {owing > 0 ? (
              <View style={{ backgroundColor: colors.dangerSoft, borderRadius: radius.lg, padding: 16, gap: 10 }} accessible accessibilityLabel={`Contas com a AngoLeva: deves ${formatKz(owing)}${cashBalance?.blocked ? ", estás indisponível até depositares" : ""}`}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <IconCircle size={48} tone="danger">
                    <CircleAlert size={24} color={colors.white} />
                  </IconCircle>
                  <View style={{ flex: 1 }}>
                    <AppText variant="label" weight="bold">
                      Contas com a AngoLeva
                    </AppText>
                    <AppText variant="body">Deves {formatKz(owing)} de taxas das corridas pagas em numerário.</AppText>
                  </View>
                </View>
                {cashBalance?.blocked ? (
                  <InfoNote tone="warning">Estás indisponível para novos pedidos até depositares. Contacta o suporte para regularizares o saldo.</InfoNote>
                ) : null}
                <SecondaryButton size="md" label="Contactar suporte" onPress={() => go("/help/chat")} />
              </View>
            ) : credit > 0 ? (
              <InfoNote tone="soft" title="Contas com a AngoLeva">
                {`A AngoLeva deve-te ${formatKz(credit)} (bónus e descontos que os clientes não te pagaram em numerário). Este valor abate às taxas das próximas corridas.`}
              </InfoNote>
            ) : null}
          </>
        )}
      </ScreenContainer>
      <SheetModal ref={monthSheet} title="Período">
        {months.map((m) => (
          <SecondaryButton key={m} tone={m === month ? "soft" : "outline"} size="md" label={m} onPress={() => { setMonth(m); monthSheet.current?.dismiss(); toast.info("Os dados do período são simulados"); }} />
        ))}
      </SheetModal>
    </View>
  );
}
