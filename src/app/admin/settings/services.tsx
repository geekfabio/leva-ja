import { useState } from 'react';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ServiceIcon } from '@/components/ui/ServiceIcon';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { toast } from '@/lib/toast';
import { assistanceServices, transportServices, vehicleClassLabel } from '@/mocks/services';

const operationalDetail: Record<string, string> = {
  tow: 'Tempo médio de chegada · 28 min',
  battery: 'Tempo médio de chegada · 19 min',
  tire: 'Tempo médio de chegada · 22 min',
  fuel: 'Tempo médio de chegada · 24 min',
  other: 'Avaliado caso a caso pela equipa',
  pickup: 'Recolha estimada · 16 min',
  cargo_medium: 'Recolha estimada · 24 min',
  cargo_large: 'Recolha estimada · 35 min · requer agendamento',
};

const initialActive: Record<string, boolean> = { tow: true, battery: true, tire: true, fuel: true, other: false, pickup: true, cargo_medium: true, cargo_large: false };

export default function ServicesSettings() {
  const [active, setActive] = useState(initialActive);
  const [createOpen, setCreateOpen] = useState(false);

  function toggle(id: string, title: string) {
    const wasActive = active[id];
    setActive((current) => ({ ...current, [id]: !current[id] }));
    toast.success({ title: wasActive ? 'Serviço desactivado' : 'Serviço activado', message: `${title} ${wasActive ? 'deixou de estar' : 'já está'} disponível para novos pedidos (mock).` });
  }

  function createService() {
    setCreateOpen(false);
    toast.success({ title: 'Serviço criado', message: 'O novo tipo de serviço foi adicionado em modo de rascunho (mock).' });
  }

  return (
    <View className="flex-1 bg-surface px-5 dark:bg-slate-950">
      <ScreenHeader title="Serviços disponíveis" subtitle="Assistência e transporte" />
      <ScrollView contentContainerClassName="pb-16">
        <Text className="mb-3 font-black text-ink dark:text-white">Assistência rodoviária</Text>
        {assistanceServices.map(({ id, title, emoji, tone }) => (
          <View key={id} className="mb-3 flex-row items-center rounded-2xl bg-white p-4 dark:bg-slate-900">
            <ServiceIcon emoji={emoji} tone={active[id] ? tone : ['#94A3B8', '#475569']} size={44} />
            <View className="ml-3 flex-1">
              <Text className="font-black text-ink dark:text-white">{title}</Text>
              <Text className="mt-1 text-sm text-muted">{operationalDetail[id]}</Text>
            </View>
            <Switch value={active[id]} onValueChange={() => toggle(id, title)} trackColor={{ true: '#16A34A' }} />
          </View>
        ))}

        <Text className="mb-3 mt-6 font-black text-ink dark:text-white">Transporte</Text>
        {transportServices.map(({ id, title, emoji, tone, vehicleClass }) => (
          <View key={id} className="mb-3 flex-row items-center rounded-2xl bg-white p-4 dark:bg-slate-900">
            <ServiceIcon emoji={emoji} tone={active[id] ? tone : ['#94A3B8', '#475569']} size={44} />
            <View className="ml-3 flex-1">
              <Text className="font-black text-ink dark:text-white">{title}</Text>
              <Text className="mt-1 text-sm text-muted">{operationalDetail[id]}{vehicleClass ? ` · ${vehicleClassLabel[vehicleClass]}` : ''}</Text>
            </View>
            <Switch value={active[id]} onValueChange={() => toggle(id, title)} trackColor={{ true: '#16A34A' }} />
          </View>
        ))}

        <Pressable onPress={() => setCreateOpen(true)} className="mt-2 flex-row items-center justify-center gap-2 rounded-2xl bg-brand-soft py-4">
          <Plus size={18} color="#16A34A" />
          <Text className="font-black text-brand">Adicionar novo serviço</Text>
        </Pressable>
      </ScrollView>

      <ConfirmModal
        visible={createOpen}
        title="Criar novo tipo de serviço?"
        description="O serviço é adicionado como rascunho e fica visível apenas à equipa até ser publicado."
        confirmLabel="Criar serviço"
        onConfirm={createService}
        onCancel={() => setCreateOpen(false)}
      />
    </View>
  );
}
