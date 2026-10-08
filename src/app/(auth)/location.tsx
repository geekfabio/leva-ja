import { useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { LocateFixed, MapPin } from 'lucide-react-native';
import { AuthScaffold } from '@/components/ui/AuthScaffold';
import { AppButton } from '@/components/ui/AppButton';

export default function LocationScreen() {
  const [locating, setLocating] = useState(false);

  function requestLocation() {
    setLocating(true);
    setTimeout(() => router.replace('/(auth)/address'), 450);
  }

  return (
    <AuthScaffold title="Onde vais receber?" description="A tua localização ajuda-nos a mostrar serviços disponíveis e calcular a entrega." showBack={false}>
      <View className="items-center rounded-3xl bg-white px-6 py-9 dark:bg-slate-900">
        <View className="mb-6 h-24 w-24 items-center justify-center rounded-[32px] bg-brand-soft"><MapPin size={42} color="#FF5B26" /></View>
        <Text className="text-center text-xl font-black text-ink dark:text-white">A tua área define o que está disponível.</Text>
        <Text className="mt-3 text-center text-sm leading-6 text-muted">Usamos a localização apenas para preparar a tua experiência de entrega.</Text>
      </View>
      <View className="mt-6 gap-3"><AppButton label={locating ? 'A localizar...' : 'Usar a minha localização'} icon={<LocateFixed size={18} color="white" />} onPress={requestLocation} /><AppButton label="Introduzir morada manualmente" variant="ghost" onPress={() => router.push('/(auth)/address')} /></View>
    </AuthScaffold>
  );
}
