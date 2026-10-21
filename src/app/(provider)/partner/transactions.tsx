import { useState } from "react";
import { View } from "react-native";
import { AppText, EmptyState, ErrorState, LoadingState, ScreenContainer, SegmentedTabs, TransactionRow } from "@/components/kit";
import { ProviderHeader } from "@/components/partner/ProviderHeader";
import { useTransactions } from "@/services/queries";
import { dayGroupLabel } from "@/utils/date";
import type { Transaction } from "@/types/domain";
import { colors } from "@/theme/colors";

type Filter = "all" | "earning" | "withdrawal";

/** 39 · Transacções agrupadas por dia, com filtros. */
export default function TransactionsScreen() {
  const [filter, setFilter] = useState<Filter>("all");
  const { data, isLoading, isError, refetch, isRefetching } = useTransactions(filter);
  const groups = (data ?? []).reduce<{ label: string; items: Transaction[] }[]>((acc, t) => {
    const label = dayGroupLabel(t.at);
    const last = acc[acc.length - 1];
    if (last?.label === label) last.items.push(t);
    else acc.push({ label, items: [t] });
    return acc;
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ProviderHeader back />
      <ScreenContainer edges={[]} gap={12} refreshing={isRefetching} onRefresh={refetch} contentStyle={{ paddingTop: 18 }}>
        <AppText variant="display" accessibilityRole="header" style={{ fontSize: 32 }}>
          Transacções
        </AppText>
        <SegmentedTabs
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "Todos" },
            { value: "earning", label: "Recebidos" },
            { value: "withdrawal", label: "Levantamentos" },
          ]}
        />
        {isLoading ? (
          <LoadingState rows={4} />
        ) : isError ? (
          <ErrorState onRetry={refetch} />
        ) : groups.length ? (
          groups.map((g) => (
            <View key={g.label} style={{ gap: 10 }}>
              <AppText variant="label" color={colors.text} style={{ marginTop: 6 }}>
                {g.label}
              </AppText>
              {g.items.map((t) => (
                <TransactionRow key={t.id} transaction={t} />
              ))}
            </View>
          ))
        ) : (
          <EmptyState title="Sem transacções" description="Os teus ganhos e levantamentos aparecem aqui." />
        )}
      </ScreenContainer>
    </View>
  );
}
