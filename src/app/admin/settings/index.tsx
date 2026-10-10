import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Bell, ChevronRight, MapPinned, Plug, ShieldAlert, SlidersHorizontal, UserCog, UsersRound } from 'lucide-react-native';
import { AdminShell } from '@/components/admin/AdminShell';
import { toast } from '@/lib/toast';

const categories = [
  { icon: SlidersHorizontal, title: 'Serviços disponíveis', detail: 'Reboque, bateria, pneu e combustível', href: '/admin/settings/services' },
  { icon: MapPinned, title: 'Zonas e preços', detail: 'Tarifas, multiplicadores e cobertura em Luanda', href: '/admin/pricing' },
  { icon: Bell, title: 'Notificações e campanhas', detail: 'Modelos de aviso e campanhas segmentadas', href: '/admin/settings/notifications' },
  { icon: ShieldAlert, title: 'Políticas de segurança', detail: 'Cancelamentos, SOS e sessões administrativas', href: '/admin/settings/security' },
  { icon: UsersRound, title: 'Equipa e permissões', detail: 'Convidar e gerir contas da equipa operacional', href: '/admin/settings/team' },
  { icon: Plug, title: 'Integrações e pagamentos', detail: 'Multicaixa, carteiras móveis e chaves de API', href: '/admin/settings/integrations' },
  { icon: UserCog, title: 'Perfil da conta', detail: 'Dados pessoais, password e sessão actual', href: '/admin/settings/profile' },
] as const;

export default function SettingsHub() {
  const [enabled, setEnabled] = useState(true);

  function toggleAccepting() {
    const next = !enabled;
    setEnabled(next);
    toast.success({ title: next ? 'A aceitar novos pedidos' : 'Novos pedidos em pausa', message: next ? 'A plataforma volta a distribuir pedidos aos prestadores (mock).' : 'Nenhum novo pedido será atribuído até reactivar (mock).' });
  }

  return (
    <AdminShell active="Configurações">
      <Text className="text-sm text-muted">Operações · configurações mockadas</Text>
      <Text className="mt-1 text-3xl font-black text-ink dark:text-white">Configurações</Text>
      <Text className="mt-1 text-sm text-muted">Gere serviços, preços, segurança e a equipa da plataforma.</Text>

      <View className="mb-6 mt-6 flex-row items-center justify-between rounded-3xl bg-ink p-5">
        <View className="flex-1 pr-3">
          <Text className="font-black text-white">Aceitar novos pedidos</Text>
          <Text className="mt-1 text-sm text-slate-300">Controlo operacional geral da plataforma</Text>
        </View>
        <Pressable onPress={toggleAccepting} className={`rounded-full px-4 py-2 ${enabled ? 'bg-brand' : 'bg-slate-700'}`}>
          <Text className="font-black text-white">{enabled ? 'Activo' : 'Pausado'}</Text>
        </Pressable>
      </View>

      <View className="flex-row flex-wrap gap-3">
        {categories.map(({ icon: Icon, title, detail, href }) => (
          <Pressable key={title} onPress={() => router.push(href as never)} className="min-w-72 flex-1 flex-row items-center rounded-2xl bg-white p-4 dark:bg-slate-900">
            <View className="rounded-xl bg-brand-soft p-3">
              <Icon size={20} color="#16A34A" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-black text-ink dark:text-white">{title}</Text>
              <Text className="mt-1 text-sm text-muted">{detail}</Text>
            </View>
            <ChevronRight size={19} color="#94A3B8" />
          </Pressable>
        ))}
      </View>
    </AdminShell>
  );
}
