import { useState } from 'react';
import { Pressable, Switch, Text, TextInput, View } from 'react-native';
import { Check, MapPinned, Save, Truck, Wrench } from 'lucide-react-native';
import { AdminShell } from '@/components/admin/AdminShell';
import { OperationsChart } from '@/components/admin/OperationsChart';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { toast } from '@/lib/toast';

const services = [
  ['Reboque de viaturas', '8 000 + 450/km', Truck],
  ['Assistência na estrada', '5 000 + 350/km', Wrench],
  ['Reboque de motas', '6 000 + 400/km', Truck],
];

export default function PricingScreen() {
  const [base, setBase] = useState('8 000');
  const [perKm, setPerKm] = useState('450');
  const [active, setActive] = useState([true, true, true]);
  const [publishOpen, setPublishOpen] = useState(false);

  function saveDraft() {
    toast.success({ title: 'Rascunho guardado', message: 'As alterações da Zona Centro foram guardadas (mock).' });
  }

  function publish() {
    setPublishOpen(false);
    toast.success({ title: 'Preços publicados', message: 'A nova tabela da Zona Centro já está activa para clientes e prestadores (mock).' });
  }

  return (
    <AdminShell active="Mapa operacional">
      <Text className="text-3xl font-black text-ink dark:text-white">Preços e cobertura</Text>
      <Text className="mt-1 text-sm text-muted">Define zonas, tarifas e regras de atendimento em Luanda.</Text>

      <View className="mt-7 flex-row flex-wrap gap-5">
        <View className="w-full rounded-3xl bg-white p-5 dark:bg-slate-900 lg:min-w-[500px] lg:flex-[3]">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-black text-ink dark:text-white">Zonas de cobertura em Luanda</Text>
              <Text className="mt-1 text-sm text-muted">Selecciona uma zona para configurar preços.</Text>
            </View>
            <MapPinned size={23} color="#16A34A" />
          </View>
          <View className="mt-5 h-72 items-center justify-center rounded-2xl bg-green-100">
            <View className="h-40 w-52 items-center justify-center rounded-[70px] border-4 border-green-700 bg-green-200">
              <Text className="text-xl font-black text-ink">Luanda</Text>
              <Text className="mt-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-brand">Zona Centro · 1,0×</Text>
            </View>
            <Text className="absolute left-6 top-6 rounded-full bg-white px-3 py-2 text-xs font-bold text-brand">Zona Norte · 1,2×</Text>
            <Text className="absolute bottom-6 right-6 rounded-full bg-white px-3 py-2 text-xs font-bold text-brand">Zona Sul · 1,3×</Text>
          </View>
        </View>

        <View className="w-full rounded-3xl bg-white p-5 dark:bg-slate-900 lg:min-w-80 lg:flex-1">
          <Text className="text-lg font-black text-ink dark:text-white">Editar preços · Zona Centro</Text>
          <Text className="mt-1 text-sm text-muted">As alterações ficam em rascunho até publicação.</Text>

          <Text className="mb-2 mt-5 text-sm font-bold text-ink dark:text-white">Taxa base (AOA)</Text>
          <TextInput value={base} onChangeText={setBase} keyboardType="numeric" className="rounded-xl bg-slate-100 px-4 py-3 font-black text-ink dark:bg-slate-800 dark:text-white" />

          <Text className="mb-2 mt-4 text-sm font-bold text-ink dark:text-white">Taxa por km (AOA)</Text>
          <TextInput value={perKm} onChangeText={setPerKm} keyboardType="numeric" className="rounded-xl bg-slate-100 px-4 py-3 font-black text-ink dark:bg-slate-800 dark:text-white" />

          <Text className="mb-2 mt-5 text-sm font-bold text-ink dark:text-white">Multiplicador por horário</Text>
          <View className="flex-row gap-2">
            {[['00–06', '1,5×'], ['06–12', '1,0×'], ['12–18', '1,1×'], ['18–00', '1,3×']].map(([time, value]) => (
              <View key={time} className={`flex-1 rounded-xl p-2 ${time === '06–12' ? 'bg-brand-soft' : 'bg-slate-100 dark:bg-slate-800'}`}>
                <Text className="text-[10px] text-muted">{time}</Text>
                <Text className="mt-1 font-black text-ink dark:text-white">{value}</Text>
              </View>
            ))}
          </View>

          {services.map(([label, price, Icon], index) => {
            const ItemIcon = Icon as typeof Truck;
            return (
              <View key={label as string} className="mt-4 flex-row items-center">
                <View className="rounded-xl bg-brand-soft p-2">
                  <ItemIcon size={18} color="#16A34A" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-black text-ink dark:text-white">{label as string}</Text>
                  <Text className="mt-1 text-xs text-muted">{price as string}</Text>
                </View>
                <Switch
                  value={active[index]}
                  onValueChange={(value) => setActive((items) => items.map((item, position) => (position === index ? value : item)))}
                  trackColor={{ true: '#16A34A' }}
                />
              </View>
            );
          })}

          <View className="mt-6 flex-row gap-2">
            <Pressable onPress={saveDraft} className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-brand-soft py-3">
              <Save size={18} color="#16A34A" />
              <Text className="font-black text-brand">Guardar rascunho</Text>
            </Pressable>
            <Pressable onPress={() => setPublishOpen(true)} className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-brand py-3">
              <Check size={18} color="#fff" />
              <Text className="font-black text-white">Publicar</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View className="mt-5">
        <OperationsChart />
      </View>

      <ConfirmModal
        visible={publishOpen}
        title="Publicar nova tabela de preços?"
        description="A Zona Centro passa a usar imediatamente a taxa base, taxa por km e multiplicadores definidos. Clientes e prestadores verão os novos valores nos próximos pedidos."
        confirmLabel="Publicar agora"
        onConfirm={publish}
        onCancel={() => setPublishOpen(false)}
      />
    </AdminShell>
  );
}
