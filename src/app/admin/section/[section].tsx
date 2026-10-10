import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronRight, Download, Plus } from 'lucide-react-native';
import { AdminShell } from '@/components/admin/AdminShell';
import { AdminTableControls } from '@/components/admin/AdminTableControls';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { toast } from '@/lib/toast';
import { adminRows } from '@/mocks/admin';

const titles: Record<string, string> = { orders: 'Monitor de pedidos', customers: 'Clientes', providers: 'Prestadores', payments: 'Pagamentos e recibos', safety: 'Segurança e SOS' };
const nav: Record<string, string> = { orders: 'Pedidos', customers: 'Clientes', providers: 'Prestadores', payments: 'Pagamentos', safety: 'SOS' };
const sidebarActive: Record<string, string> = { orders: 'Serviços', customers: 'Clientes', providers: 'Prestadores', payments: 'Financeiro', safety: 'Segurança' };
const detailType: Record<string, string> = { orders: 'order', customers: 'customer', providers: 'provider', payments: 'payment', safety: 'safety' };
const createLabel: Record<string, string> = { orders: 'Novo pedido', customers: 'Novo cliente', providers: 'Novo prestador', payments: 'Novo registo', safety: 'Novo alerta' };

export default function AdminSection() {
  const { section = 'orders' } = useLocalSearchParams<{ section: string }>();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('Todos');
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (section === 'settings') router.replace('/admin/settings' as never);
  }, [section]);

  const rows = adminRows[section] ?? [];
  const filtered = useMemo(
    () =>
      rows
        .filter((row) => filter === 'Todos' || row.status === filter)
        .filter((row) => `${row.id} ${row.name} ${row.detail} ${row.status}`.toLowerCase().includes(query.toLowerCase())),
    [rows, query, filter],
  );
  const perPage = 6;
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const visible = filtered.slice((page - 1) * perPage, page * perPage);
  const statuses = ['Todos', ...Array.from(new Set(rows.map((row) => row.status)))];

  if (section === 'settings') return null;

  function openDetail(id: string) {
    router.push(`/admin/detail/${detailType[section] ?? 'order'}/${id}` as never);
  }

  function createItem() {
    setCreateOpen(false);
    toast.success({ title: `${createLabel[section] ?? 'Novo registo'} criado`, message: 'Registo adicionado à lista (mock).' });
  }

  function exportList() {
    toast.success({ title: 'Lista exportada', message: `${filtered.length} registos de "${titles[section]}" exportados para CSV (mock).` });
  }

  return (
    <AdminShell active={sidebarActive[section] ?? 'Serviços'} navActive={nav[section] ?? 'Pedidos'}>
      <Text className="text-sm text-muted">Operações · dados mockados</Text>
      <View className="flex-row items-center justify-between">
        <Text className="mt-1 text-3xl font-black text-ink dark:text-white">{titles[section] ?? titles.orders}</Text>
        <Pressable onPress={() => setCreateOpen(true)} className="rounded-2xl bg-brand p-3">
          <Plus size={20} color="#fff" />
        </Pressable>
      </View>

      <View className="mb-4 mt-5 flex-row gap-2">
        <View className="flex-1 rounded-2xl bg-ink p-4">
          <Text className="text-xs font-bold text-green-200">TOTAL</Text>
          <Text className="mt-1 text-2xl font-black text-white">{rows.length}</Text>
        </View>
        <View className="flex-1 rounded-2xl bg-white p-4 dark:bg-slate-900">
          <Text className="text-xs font-bold text-muted">EM DESTAQUE</Text>
          <Text className="mt-1 text-2xl font-black text-brand">{rows.filter((row) => !['Concluído', 'Resolvido', 'Confirmado', 'Aprovado'].includes(row.status)).length}</Text>
        </View>
      </View>

      <AdminTableControls
        query={query}
        setQuery={(value) => {
          setQuery(value);
          setPage(1);
        }}
        page={page}
        pages={pages}
        setPage={setPage}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        <View className="flex-row gap-2">
          {statuses.map((status) => (
            <Pressable
              key={status}
              onPress={() => {
                setFilter(status);
                setPage(1);
              }}
              className={`rounded-full px-3 py-2 ${filter === status ? 'bg-brand' : 'bg-white dark:bg-slate-900'}`}
            >
              <Text className={`text-xs font-bold ${filter === status ? 'text-white' : 'text-muted'}`}>{status}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {visible.map((row) => (
        <Pressable key={row.id} onPress={() => openDetail(row.id)} className="mb-3 rounded-2xl bg-white p-4 dark:bg-slate-900">
          <View className="flex-row items-start">
            <View className="flex-1">
              <Text className="font-black text-ink dark:text-white">{row.name}</Text>
              <Text className="mt-1 text-sm text-muted">{row.id} · {row.detail}</Text>
              <Text className="mt-2 text-xs text-muted">{row.date}{row.amount ? ` · ${row.amount.toLocaleString('pt-PT')} Kz` : ''}</Text>
            </View>
            <ChevronRight size={20} color="#94A3B8" />
          </View>
          <View className="mt-3 self-start rounded-full bg-brand-soft px-3 py-1">
            <Text className="text-xs font-black text-brand">{row.status}</Text>
          </View>
        </Pressable>
      ))}
      {visible.length === 0 && <Text className="py-10 text-center text-muted">Não encontrámos resultados.</Text>}

      <Pressable onPress={exportList} className="mt-3 flex-row items-center justify-center gap-2 rounded-2xl bg-brand-soft py-4">
        <Download size={19} color="#16A34A" />
        <Text className="font-black text-brand">Exportar lista (mock)</Text>
      </Pressable>

      <ConfirmModal
        visible={createOpen}
        title={createLabel[section] ?? 'Novo registo'}
        description="Esta acção cria um registo de demonstração nesta lista. Nenhum dado real é enviado."
        confirmLabel="Criar"
        onConfirm={createItem}
        onCancel={() => setCreateOpen(false)}
      />
    </AdminShell>
  );
}
