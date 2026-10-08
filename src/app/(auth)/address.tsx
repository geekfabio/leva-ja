import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Home, MapPin } from 'lucide-react-native';
import { AuthScaffold } from '@/components/ui/AuthScaffold';
import { AppButton } from '@/components/ui/AppButton';

export default function AddressScreen() {
  const [address, setAddress] = useState('');
  const valid = address.trim().length >= 5;

  return (
    <AuthScaffold title="Adiciona a tua morada" description="Podes actualizar ou criar mais endereços a qualquer momento.">
      <View className="rounded-3xl bg-white p-5 dark:bg-slate-900">
        <View className="mb-5 h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft"><Home size={22} color="#16A34A" /></View>
        <Text className="mb-2 text-sm font-bold text-ink dark:text-white">Morada principal</Text>
        <View className="flex-row items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800"><MapPin size={20} color="#16A34A" /><TextInput value={address} onChangeText={setAddress} placeholder="Ex.: Rua da Missão, Ingombota" multiline className="min-h-14 flex-1 text-base font-medium text-ink dark:text-white" placeholderTextColor="#94A3B8" /></View>
        <Text className="mt-3 text-xs leading-5 text-muted">Inclui a rua, zona ou ponto de referência para localizar a assistência com mais precisão.</Text>
      </View>
      <View className="mt-6"><AppButton label="Guardar e continuar" disabled={!valid} onPress={() => router.replace('/(tabs)')} /></View>
    </AuthScaffold>
  );
}
