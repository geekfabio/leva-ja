import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Radar, ShieldCheck } from 'lucide-react-native';
import { MotiView } from 'moti';
import { AppButton } from '@/components/ui/AppButton';

export default function TransportMatchingScreen() {
  return (
    <View className="flex-1 justify-between bg-ink px-6 pb-12 pt-20">
      <View>
        <MotiView from={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'timing', duration: 500 }} className="h-24 w-24 items-center justify-center rounded-[32px] bg-brand">
          <Radar size={46} color="#fff" />
        </MotiView>
        <Text className="mt-10 text-4xl font-black leading-tight text-white">A procurar{`\n`}um transportador perto.</Text>
        <Text className="mt-4 max-w-sm text-base leading-7 text-slate-300">Estamos a contactar transportadores verificados na tua zona.</Text>
        <View className="mt-10 rounded-3xl bg-white/10 p-5">
          <View className="flex-row items-center gap-3">
            <ShieldCheck size={23} color="#86EFAC" />
            <View><Text className="font-black text-white">Pedido #LJ-3001</Text><Text className="mt-1 text-sm text-slate-300">Receberás uma actualização já a seguir.</Text></View>
          </View>
        </View>
      </View>
      <View className="gap-3">
        <AppButton label="Ver transportador encontrado" onPress={() => router.replace('/order/LJ-3001')} />
        <AppButton label="Cancelar pedido" variant="ghost" onPress={() => router.replace('/(tabs)')} />
      </View>
    </View>
  );
}
