import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Bell, CheckCircle2, Clock3, Layers3, MapPin, MoreHorizontal, Truck, Users } from 'lucide-react-native';
import { AdminShell } from '@/components/admin/AdminShell';
import { AdminMetric } from '@/components/admin/AdminMetric';
import { OperationsChart } from '@/components/admin/OperationsChart';
import { toast } from '@/lib/toast';

const live = [
  ['LD-32-AB', 'Reboque', 'Talatona, Rua do MAT', '12 min', 'A caminho'],
  ['LD-09-CP', 'Assistência de bateria', 'Kilamba, Condomínio Cruzeiro', '8 min', 'No local'],
  ['LD-77-KM', 'Reboque', 'Benfica, Via Expressa', '20 min', 'A caminho'],
  ['LD-21-PT', 'Pneu furado', 'Maianga, Junto ao BAI', '—', 'A aguardar'],
];
const docs = [
  ['Manuel Tavares', 'BI e Carta de Condução', 'Urgente'],
  ['Transportes Kiala, Lda.', 'Certidão Comercial', 'Urgente'],
  ['Joana Miguel', 'Carta de Condução', 'Urgente'],
  ['Ngola Reboques', 'Seguro da Viatura', 'Normal'],
];

export default function AdminDashboard() {
  const [approved, setApproved] = useState<string[]>([]);

  function approve(name: string) {
    setApproved((current) => [...current, name]);
    toast.success({ title: 'Documento aprovado', message: `${name} foi notificado da aprovação (mock).` });
  }

  return (
    <AdminShell active="Visão geral">
      <View className="flex-row items-start justify-between">
        <View>
          <Text className="text-3xl font-black text-ink dark:text-white">Boa tarde, Equipa Leva Já!</Text>
          <Text className="mt-1 text-sm text-muted">Aqui está o panorama operacional de hoje, 9 de Outubro de 2026.</Text>
        </View>
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => toast.info({ title: 'Notificações', message: '3 novas actualizações operacionais (mock).' })}
            className="rounded-xl bg-white p-3 dark:bg-slate-900"
          >
            <Bell size={20} color="#102018" />
          </Pressable>
          <Pressable onPress={() => router.push('/admin/settings/profile' as never)} className="h-10 w-10 items-center justify-center rounded-full bg-ink">
            <Text className="font-black text-white">AS</Text>
          </Pressable>
        </View>
      </View>

      <View className="mt-7 flex-row flex-wrap gap-3">
        <AdminMetric label="Ordens hoje" value="42" icon={<Layers3 size={19} color="#16A34A" />} />
        <AdminMetric label="Serviços em curso" value="18" icon={<Truck size={19} color="#16A34A" />} />
        <AdminMetric label="Taxa de aceitação" value="96%" icon={<CheckCircle2 size={19} color="#16A34A" />} />
        <AdminMetric label="Tempo médio de chegada" value="28 min" icon={<Clock3 size={19} color="#16A34A" />} />
      </View>

      <View className="mt-5 flex-row flex-wrap gap-5">
        <View className="w-full lg:min-w-[580px] lg:flex-[3]">
          <OperationsChart />
        </View>
        <View className="w-full rounded-3xl bg-ink p-5 lg:min-w-56 lg:flex-1">
          <Text className="text-lg font-black text-white">Resumo da semana</Text>
          {[
            ['Receita total', '7 850 000 AOA'],
            ['Total de ordens', '238'],
            ['Ticket médio', '32 983 AOA'],
            ['Serviços concluídos', '221'],
          ].map(([label, value]) => (
            <View key={label} className="border-b border-white/10 py-4">
              <Text className="text-sm text-slate-300">{label}</Text>
              <Text className="mt-1 text-xl font-black text-white">{value}</Text>
            </View>
          ))}
          <Pressable onPress={() => router.push('/admin/reports' as never)} className="mt-4 rounded-xl bg-white/10 py-3">
            <Text className="text-center font-black text-white">Ver relatório completo →</Text>
          </Pressable>
        </View>
      </View>

      <View className="mt-5 flex-row flex-wrap gap-5">
        <View className="w-full rounded-3xl bg-white p-5 dark:bg-slate-900 lg:min-w-[560px] lg:flex-[3]">
          <View className="mb-4 flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-black text-ink dark:text-white">Serviços em curso agora</Text>
              <Text className="mt-1 text-sm text-muted">18 atendimentos em andamento · actualização simulada</Text>
            </View>
            <Pressable onPress={() => router.push('/admin/section/orders' as never)}>
              <Text className="font-black text-brand">Ver todos →</Text>
            </Pressable>
          </View>
          {live.map(([plate, service, place, eta, state]) => (
            <Pressable
              key={plate}
              onPress={() => router.push(`/admin/detail/order/${plate}` as never)}
              className="flex-row items-center border-t border-slate-100 py-3 dark:border-slate-800"
            >
              <View className="h-9 w-14 items-center justify-center rounded-lg bg-brand-soft">
                <Text className="text-xs font-black text-brand">{plate}</Text>
              </View>
              <View className="ml-3 flex-1">
                <Text className="font-black text-ink dark:text-white">{service}</Text>
                <View className="mt-1 flex-row items-center gap-1">
                  <MapPin size={12} color="#16A34A" />
                  <Text className="text-xs text-muted">{place}</Text>
                </View>
              </View>
              <View>
                <Text className="text-right font-black text-ink dark:text-white">{eta}</Text>
                <Text className="mt-1 rounded-full bg-brand-soft px-2 py-1 text-[10px] font-black text-brand">{state}</Text>
              </View>
              <MoreHorizontal className="ml-2" size={18} color="#94A3B8" />
            </Pressable>
          ))}
        </View>

        <View className="w-full rounded-3xl bg-white p-5 dark:bg-slate-900 lg:min-w-72 lg:flex-1">
          <View className="mb-4 flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-black text-ink dark:text-white">Aprovações de documentos</Text>
              <Text className="mt-1 text-sm text-muted">Fila prioritária</Text>
            </View>
            <Users size={20} color="#16A34A" />
          </View>
          {docs.map(([name, document, priority]) => (
            <View key={name} className="border-t border-slate-100 py-3 dark:border-slate-800">
              <View className="flex-row">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-brand-soft">
                  <Text className="text-xs font-black text-brand">{name.slice(0, 2)}</Text>
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-black text-ink dark:text-white">{name}</Text>
                  <Text className="mt-1 text-xs text-muted">{document}</Text>
                </View>
                <Text className="text-[10px] font-black text-red-500">{priority}</Text>
              </View>
              {approved.includes(name) ? (
                <Text className="mt-2 font-bold text-brand">Aprovado</Text>
              ) : (
                <Pressable onPress={() => approve(name)} className="mt-3 self-end rounded-lg bg-brand px-3 py-2">
                  <Text className="text-xs font-black text-white">Aprovar</Text>
                </Pressable>
              )}
            </View>
          ))}
          <Pressable onPress={() => router.push('/admin/section/providers' as never)} className="mt-3 rounded-xl bg-brand-soft py-3">
            <Text className="text-center font-black text-brand">Ver todos os documentos →</Text>
          </Pressable>
        </View>
      </View>
    </AdminShell>
  );
}
