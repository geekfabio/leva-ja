import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Download, FileBarChart2, ShieldCheck, Star, TrendingUp, Truck } from 'lucide-react-native';
import { AdminShell } from '@/components/admin/AdminShell';
import { OperationsChart } from '@/components/admin/OperationsChart';
import { BreakdownBars } from '@/components/admin/BreakdownBars';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { toast } from '@/lib/toast';
import {
  paymentMethodBreakdown,
  recentTransactions,
  reportPeriods,
  reportSummaryByPeriod,
  serviceBreakdown,
  topProviders,
  type ReportPeriod,
} from '@/mocks/reports';

const reportTypes = ['Operacional', 'Financeiro', 'Prestadores'] as const;
type ReportType = (typeof reportTypes)[number];

export default function Reports() {
  const [period, setPeriod] = useState<ReportPeriod>('Esta semana');
  const [reportType, setReportType] = useState<ReportType>('Operacional');
  const [exportOpen, setExportOpen] = useState(false);
  const summary = reportSummaryByPeriod[period];

  const statusColors: Record<string, string> = { Confirmado: 'bg-brand-soft text-brand', Pendente: 'bg-amber-100 text-amber-700', Reembolsado: 'bg-blue-100 text-blue-700' };

  const fileName = useMemo(() => {
    const slug = reportType.toLowerCase();
    const periodSlug = period.toLowerCase().replace(/\s+/g, '-');
    return `relatorio-${slug}-${periodSlug}.csv`;
  }, [reportType, period]);

  function confirmExport() {
    setExportOpen(false);
    toast.success({ title: 'Relatório exportado', message: `${fileName} gerado (mock) — disponível nos seus downloads.` });
  }

  return (
    <AdminShell active="Relatórios">
      <View className="flex-row items-start justify-between">
        <View>
          <Text className="text-3xl font-black text-ink dark:text-white">Relatórios</Text>
          <Text className="mt-1 text-sm text-muted">Análise operacional, financeira e de prestadores · dados mockados</Text>
        </View>
        <Pressable onPress={() => setExportOpen(true)} className="flex-row items-center gap-2 rounded-2xl bg-brand px-4 py-3">
          <Download size={18} color="#fff" />
          <Text className="font-black text-white">Exportar</Text>
        </Pressable>
      </View>

      <View className="mt-6 flex-row gap-2">
        {reportPeriods.map((item) => (
          <Pressable key={item} onPress={() => setPeriod(item)} className={`rounded-full px-4 py-2 ${period === item ? 'bg-brand' : 'bg-white dark:bg-slate-900'}`}>
            <Text className={`text-xs font-black ${period === item ? 'text-white' : 'text-ink dark:text-white'}`}>{item}</Text>
          </Pressable>
        ))}
      </View>

      <View className="mb-2 mt-4 flex-row gap-2">
        {reportTypes.map((item) => (
          <Pressable key={item} onPress={() => setReportType(item)} className={`flex-1 rounded-xl py-3 ${reportType === item ? 'bg-ink' : 'bg-white dark:bg-slate-900'}`}>
            <Text className={`text-center text-xs font-black ${reportType === item ? 'text-white' : 'text-ink dark:text-white'}`}>{item}</Text>
          </Pressable>
        ))}
      </View>

      <View className="mt-5 flex-row flex-wrap gap-3">
        <View className="min-w-36 flex-1 rounded-2xl bg-white p-4 dark:bg-slate-900">
          <TrendingUp size={20} color="#16A34A" />
          <Text className="mt-3 text-2xl font-black text-ink dark:text-white">{summary.revenue}</Text>
          <Text className="mt-1 text-xs text-muted">Receita no período</Text>
        </View>
        <View className="min-w-36 flex-1 rounded-2xl bg-white p-4 dark:bg-slate-900">
          <Truck size={20} color="#16A34A" />
          <Text className="mt-3 text-2xl font-black text-ink dark:text-white">{summary.orders}</Text>
          <Text className="mt-1 text-xs text-muted">Pedidos concluídos</Text>
        </View>
        <View className="min-w-36 flex-1 rounded-2xl bg-white p-4 dark:bg-slate-900">
          <FileBarChart2 size={20} color="#16A34A" />
          <Text className="mt-3 text-2xl font-black text-ink dark:text-white">{summary.avgTicket}</Text>
          <Text className="mt-1 text-xs text-muted">Ticket médio</Text>
        </View>
        <View className="min-w-36 flex-1 rounded-2xl bg-white p-4 dark:bg-slate-900">
          <ShieldCheck size={20} color="#16A34A" />
          <Text className="mt-3 text-2xl font-black text-ink dark:text-white">{summary.completion}</Text>
          <Text className="mt-1 text-xs text-muted">Taxa de conclusão</Text>
        </View>
      </View>

      <View className="mt-5 flex-row flex-wrap gap-5">
        <View className="w-full lg:min-w-[500px] lg:flex-[3]">
          <OperationsChart />
        </View>
        <View className="w-full lg:min-w-72 lg:flex-1">
          {reportType === 'Operacional' && (
            <BreakdownBars title="Serviços por tipo" subtitle="Participação no volume do período" items={serviceBreakdown} />
          )}
          {reportType === 'Financeiro' && (
            <BreakdownBars title="Métodos de pagamento" subtitle="Participação na receita do período" items={paymentMethodBreakdown} />
          )}
          {reportType === 'Prestadores' && (
            <View className="rounded-3xl bg-white p-5 dark:bg-slate-900">
              <Text className="text-lg font-black text-ink dark:text-white">Melhores prestadores</Text>
              <Text className="mt-1 text-sm text-muted">Por serviços concluídos no período</Text>
              {topProviders.map((provider, index) => (
                <View key={provider.id} className={`flex-row items-center ${index === 0 ? 'mt-4' : 'mt-4 border-t border-slate-100 pt-4 dark:border-slate-800'}`}>
                  <View className="h-9 w-9 items-center justify-center rounded-full bg-brand-soft">
                    <Text className="text-xs font-black text-brand">#{index + 1}</Text>
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="font-black text-ink dark:text-white">{provider.name}</Text>
                    <Text className="mt-1 text-xs text-muted">{provider.services} serviços · {provider.earnings}</Text>
                  </View>
                  <View className="flex-row items-center gap-1">
                    <Star size={13} color="#F59E0B" />
                    <Text className="text-xs font-black text-ink dark:text-white">{provider.rating}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {reportType === 'Financeiro' && (
        <View className="mt-5 rounded-3xl bg-white p-5 dark:bg-slate-900">
          <Text className="text-lg font-black text-ink dark:text-white">Transacções recentes</Text>
          <Text className="mt-1 text-sm text-muted">{recentTransactions.length} lançamentos · dados mockados</Text>
          {recentTransactions.map((transaction, index) => (
            <View key={transaction.id} className={`flex-row items-center ${index === 0 ? 'mt-3' : 'mt-3 border-t border-slate-100 pt-3 dark:border-slate-800'}`}>
              <View className="flex-1">
                <Text className="font-black text-ink dark:text-white">{transaction.customer}</Text>
                <Text className="mt-1 text-xs text-muted">{transaction.id} · {transaction.order} · {transaction.method}</Text>
              </View>
              <View className="items-end">
                <Text className="font-black text-ink dark:text-white">{transaction.amount.toLocaleString('pt-PT')} Kz</Text>
                <View className={`mt-1 rounded-full px-2 py-1 ${statusColors[transaction.status]?.split(' ')[0] ?? 'bg-slate-100'}`}>
                  <Text className={`text-[10px] font-black ${statusColors[transaction.status]?.split(' ')[1] ?? 'text-slate-600'}`}>{transaction.status.toUpperCase()}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      <ConfirmModal
        visible={exportOpen}
        title="Exportar relatório"
        description={`Vamos gerar ${fileName} com os dados de ${period.toLowerCase()} para o relatório ${reportType.toLowerCase()} (ficheiro simulado).`}
        confirmLabel="Gerar e exportar"
        onConfirm={confirmExport}
        onCancel={() => setExportOpen(false)}
      />
    </AdminShell>
  );
}
