import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Crosshair, MapPin, Navigation } from 'lucide-react-native';
import { AppButton } from '@/components/ui/AppButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';

export default function TransportRouteScreen() {
  const [origin, setOrigin] = useState('Rua da Missão, Ingombota');
  const [destination, setDestination] = useState('');

  return (
    <View className="flex-1 bg-surface px-5 dark:bg-slate-950">
      <ScreenHeader title="Origem e destino" subtitle="Passo 3 de 4" />
      <ScrollView contentContainerClassName="pb-28">
        <Text className="mb-6 text-base leading-6 text-muted">No transporte, tanto a recolha como a entrega são obrigatórias.</Text>
        <View className="rounded-3xl bg-white p-5 dark:bg-slate-900">
          <View className="flex-row items-center gap-3">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-brand"><MapPin size={17} color="#fff" /></View>
            <View className="flex-1">
              <Text className="text-xs font-bold text-muted">RECOLHA</Text>
              <TextInput value={origin} onChangeText={setOrigin} placeholder="Onde recolhemos a carga?" placeholderTextColor="#94A3B8" className="font-black text-ink dark:text-white" />
            </View>
          </View>
          <View className="my-4 ml-4 h-6 w-0.5 bg-slate-200 dark:bg-slate-700" />
          <View className="flex-row items-center gap-3">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-ink"><Navigation size={16} color="#fff" /></View>
            <View className="flex-1">
              <Text className="text-xs font-bold text-muted">ENTREGA</Text>
              <TextInput value={destination} onChangeText={setDestination} placeholder="Para onde vai a carga?" placeholderTextColor="#94A3B8" className="font-black text-ink dark:text-white" />
            </View>
          </View>
        </View>
        <Pressable className="mt-4 flex-row items-center gap-3 rounded-2xl bg-white p-4 dark:bg-slate-900">
          <View className="rounded-xl bg-brand-soft p-2"><Crosshair size={20} color="#16A34A" /></View>
          <View className="flex-1">
            <Text className="font-black text-ink dark:text-white">Usar localização actual na recolha</Text>
            <Text className="mt-1 text-sm text-muted">Precisão aproximada de 10 metros</Text>
          </View>
        </Pressable>
      </ScrollView>
      <View className="absolute bottom-0 left-0 right-0 border-t border-slate-100 bg-surface px-5 pb-7 pt-4 dark:border-slate-800 dark:bg-slate-950">
        <AppButton label="Confirmar percurso" disabled={!destination.trim()} onPress={() => router.push('/transport/estimate' as never)} />
      </View>
    </View>
  );
}
