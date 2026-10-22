import { useRef, useState } from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { CalendarDays, ChartColumn, ChevronDown, FileText, Landmark, List, Settings, Upload, Wallet } from "lucide-react-native";
import { AppText, BrandLogo, Card, EarningsChart, ErrorState, IconButton, IconCircle, InfoNote, LoadingState, PrimaryButton, ProviderMetric, ScreenContainer, SecondaryButton, SheetModal, Skeleton, TextField, AnimatedAmount } from "@/components/kit";
import { NotificationBell, ProviderSummaryCard } from "@/components/partner/ProviderHeader";
import { withdrawSchema } from "@/features/provider/schemas";
import { useFinanceSummary } from "@/services/queries";
import { useProviderStore } from "@/stores/useProviderStore";
import { formatMonthYear } from "@/utils/date";
import { formatKz, formatNumber, parseAmount } from "@/utils/format";
import { go } from "@/features/navigation";
import { toast } from "@/lib/toast";
import { colors, radius } from "@/theme/colors";

const weekLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

/** 38 · Ganhos: gráfico semanal, métricas, saldo e levantamento simulado. */
export default function EarningsScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useFinanceSummary();
  const balance = useProviderStore((s) => s.balance);
  const bankAccount = useProviderStore((s) => s.payout) ?? { bank: "—", iban: "—", holder: "—" };
  const withdrawSheet = useRef<BottomSheetModal>(null);
  const monthSheet = useRef<BottomSheetModal>(null);
  const months = Array.from({ length: 4 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return formatMonthYear(d);
  });
  const [month, setMonth] = useState(months[0]!);
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState<string>();
  const [sending, setSending] = useState(false);

  const withdraw = async () => {
    const result = withdrawSchema(balance).safeParse({ amount, iban: bankAccount.iban });
    if (!result.success) return setError(result.error.issues[0]?.message);
    setError(undefined);
    setSending(true);
    const ok = await useProviderStore.getState().withdraw(amount);
    setSending(false);
    if (!ok) return setError(useProviderStore.getState().lastError ?? "Não foi possível pedir o levantamento.");
    withdrawSheet.current?.dismiss();
    toast.success({ title: "Levantamento pedido", message: `${formatKz(amount)} para ${bankAccount.bank} (simulado).` });
  };

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
                <View accessible accessibilityLabel={`Saldo disponível: ${formatKz(balance)}`}>
                  <AppText variant="body">Saldo disponível</AppText>
                  <AnimatedAmount value={balance} weight="extrabold" style={{ fontSize: 32, lineHeight: 40 }} />
                </View>
              </View>
              <PrimaryButton size="md" label="Pedir levantamento" icon={<Upload size={20} color={colors.white} />} disabled={balance < 1000} onPress={() => { setAmount(balance); withdrawSheet.current?.present(); }} />
              <SecondaryButton size="md" label="Ver transacções" icon={<List size={20} color={colors.primary} />} onPress={() => go("/partner/transactions")} />
            </View>
          </>
        )}
      </ScreenContainer>
      <SheetModal ref={monthSheet} title="Período">
        {months.map((m) => (
          <SecondaryButton key={m} tone={m === month ? "soft" : "outline"} size="md" label={m} onPress={() => { setMonth(m); monthSheet.current?.dismiss(); toast.info("Os dados do período são simulados"); }} />
        ))}
      </SheetModal>
      <SheetModal ref={withdrawSheet} title="Pedir levantamento">
        <TextField label="Valor" large keyboardType="number-pad" suffix={<AppText variant="h3" color={colors.muted}>Kz</AppText>} value={amount ? formatNumber(amount) : ""} onChangeText={(t) => setAmount(parseAmount(t))} error={error} hint={`Disponível: ${formatKz(balance)}`} />
        <Card tone="muted" style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Landmark size={24} color={colors.ink} />
          <View style={{ flex: 1 }}>
            <AppText variant="label" weight="bold">
              {bankAccount.bank} · {bankAccount.holder}
            </AppText>
            <AppText variant="caption" color={colors.muted}>
              {bankAccount.iban}
            </AppText>
          </View>
        </Card>
        <InfoNote>A transferência é simulada e fica concluída em poucos segundos.</InfoNote>
        <PrimaryButton label="Confirmar levantamento" loading={sending} onPress={withdraw} />
      </SheetModal>
    </View>
  );
}
