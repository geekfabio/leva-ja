import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Minus, Plus, Users } from 'lucide-react-native';
import { AppButton } from '@/components/ui/AppButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';

const cargoTypes = ['Mobília', 'Eletrodomésticos', 'Material de loja', 'Caixas / mudança', 'Outro'];

export default function TransportCargoScreen() {
  const [cargoType, setCargoType] = useState(cargoTypes[0]);
  const [weight, setWeight] = useState('');
  const [needsHelpers, setNeedsHelpers] = useState(false);
  const [helpers, setHelpers] = useState(1);
  const [note, setNote] = useState('');

  return (
    <View className="flex-1 bg-surface px-5 dark:bg-slate-950">
      <ScreenHeader title="Conta-nos sobre a carga" subtitle="Passo 2 de 4" />
      <ScrollView contentContainerClassName="pb-28">
        <Text className="mb-3 font-black text-ink dark:text-white">Tipo de carga</Text>
        <View className="mb-6 flex-row flex-wrap gap-2">
          {cargoTypes.map((type) => (
            <Pressable key={type} onPress={() => setCargoType(type)} className={`rounded-full px-4 py-2.5 ${cargoType === type ? 'bg-brand' : 'bg-white dark:bg-slate-900'}`}>
              <Text className={`text-xs font-black ${cargoType === type ? 'text-white' : 'text-ink dark:text-white'}`}>{type}</Text>
            </Pressable>
          ))}
        </View>

        <Text className="mb-2 font-black text-ink dark:text-white">Peso aproximado (kg)</Text>
        <TextInput
          value={weight}
          onChangeText={setWeight}
          placeholder="Ex.: 80"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          className="rounded-2xl bg-white px-4 py-4 text-ink dark:bg-slate-900 dark:text-white"
        />

        <View className="mt-6 flex-row items-center justify-between rounded-3xl bg-white p-5 dark:bg-slate-900">
          <View className="flex-1 flex-row items-center gap-3">
            <View className="rounded-xl bg-brand-soft p-2.5"><Users size={19} color="#16A34A" /></View>
            <View className="flex-1">
              <Text className="font-black text-ink dark:text-white">Preciso de ajudante(s)</Text>
              <Text className="mt-1 text-xs text-muted">Carregar e descarregar a carga</Text>
            </View>
          </View>
          <Pressable onPress={() => setNeedsHelpers((value) => !value)} className={`rounded-full px-4 py-2 ${needsHelpers ? 'bg-brand' : 'bg-slate-100 dark:bg-slate-800'}`}>
            <Text className={`font-black ${needsHelpers ? 'text-white' : 'text-ink dark:text-white'}`}>{needsHelpers ? 'Sim' : 'Não'}</Text>
          </Pressable>
        </View>

        {needsHelpers ? (
          <View className="mt-3 flex-row items-center justify-between rounded-2xl bg-white p-4 dark:bg-slate-900">
            <Text className="font-black text-ink dark:text-white">Nº de ajudantes</Text>
            <View className="flex-row items-center gap-4">
              <Pressable onPress={() => setHelpers((value) => Math.max(1, value - 1))} className="h-9 w-9 items-center justify-center rounded-full bg-brand-soft"><Minus size={16} color="#16A34A" /></Pressable>
              <Text className="w-5 text-center text-lg font-black text-ink dark:text-white">{helpers}</Text>
              <Pressable onPress={() => setHelpers((value) => Math.min(3, value + 1))} className="h-9 w-9 items-center justify-center rounded-full bg-brand-soft"><Plus size={16} color="#16A34A" /></Pressable>
            </View>
          </View>
        ) : null}

        <Text className="mb-2 mt-6 font-black text-ink dark:text-white">Nota adicional (opcional)</Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          multiline
          placeholder="Ex.: caixas frágeis, precisa de elevador"
          placeholderTextColor="#94A3B8"
          className="min-h-24 rounded-2xl bg-white p-4 text-ink dark:bg-slate-900 dark:text-white"
        />
      </ScrollView>
      <View className="absolute bottom-0 left-0 right-0 border-t border-slate-100 bg-surface px-5 pb-7 pt-4 dark:border-slate-800 dark:bg-slate-950">
        <AppButton label="Continuar" onPress={() => router.push('/transport/route' as never)} />
      </View>
    </View>
  );
}
