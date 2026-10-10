import { useState } from 'react';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { BatteryCharging, Fuel, Plus, Truck, Wrench } from 'lucide-react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { toast } from '@/lib/toast';

const initialServices = [
  { id: 'tow', icon: Truck, title: 'Reboque de viaturas', detail: 'Tempo médio de chegada · 28 min', active: true },
  { id: 'battery', icon: BatteryCharging, title: 'Assistência de bateria', detail: 'Tempo médio de chegada · 19 min', active: true },
  { id: 'tyre', icon: Wrench, title: 'Pneu furado', detail: 'Tempo médio de chegada · 22 min', active: true },
  { id: 'fuel', icon: Fuel, title: 'Entrega de combustível', detail: 'Tempo médio de chegada · 24 min', active: false },
  { id: 'moto', icon: Truck, title: 'Reboque de motas', detail: 'Tempo médio de chegada · 17 min', active: true },
];

export default function ServicesSettings() {
  const [services, setServices] = useState(initialServices);
  const [createOpen, setCreateOpen] = useState(false);

  function toggle(id: string) {
    setServices((current) => current.map((service) => (service.id === id ? { ...service, active: !service.active } : service)));
    const service = services.find((item) => item.id === id);
    if (service) {
      toast.success({ title: service.active ? 'Serviço desactivado' : 'Serviço activado', message: `${service.title} ${service.active ? 'deixou de estar' : 'já está'} disponível para novos pedidos (mock).` });
    }
  }

  function createService() {
    setCreateOpen(false);
    toast.success({ title: 'Serviço criado', message: 'O novo tipo de assistência foi adicionado em modo de rascunho (mock).' });
  }

  return (
    <View className="flex-1 bg-surface px-5 dark:bg-slate-950">
      <ScreenHeader title="Serviços disponíveis" subtitle="Activa ou desactiva tipos de assistência" />
      <ScrollView contentContainerClassName="pb-16">
        {services.map(({ id, icon: Icon, title, detail, active }) => (
          <View key={id} className="mb-3 flex-row items-center rounded-2xl bg-white p-4 dark:bg-slate-900">
            <View className={`rounded-xl p-3 ${active ? 'bg-brand-soft' : 'bg-slate-100 dark:bg-slate-800'}`}>
              <Icon size={20} color={active ? '#16A34A' : '#94A3B8'} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="font-black text-ink dark:text-white">{title}</Text>
              <Text className="mt-1 text-sm text-muted">{detail}</Text>
            </View>
            <Switch value={active} onValueChange={() => toggle(id)} trackColor={{ true: '#16A34A' }} />
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
