import { useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Bike, MapPinned, PackageCheck } from 'lucide-react-native';
import { MotiView } from 'moti';
import { AppButton } from '@/components/ui/AppButton';
import { BrandMark } from '@/components/ui/BrandMark';
import { ProgressDots } from '@/components/ui/ProgressDots';

const slides = [
  { icon: PackageCheck, eyebrow: 'ESCOLHE', title: 'Tudo o que precisas num só lugar.', text: 'Explora restaurantes, supermercados, farmácias e pedidos de entrega.' },
  { icon: MapPinned, eyebrow: 'ACOMPANHA', title: 'Sabe sempre onde está o teu pedido.', text: 'Recebe actualizações claras desde a confirmação até à chegada.' },
  { icon: Bike, eyebrow: 'RECEBE', title: 'Chega até ti, sem complicação.', text: 'Entrega rápida, comunicação simples e uma experiência feita para Luanda.' },
];

export default function OnboardingScreen() {
  const [current, setCurrent] = useState(0);
  const item = slides[current];
  const Icon = item.icon;
  const isLast = current === slides.length - 1;

  function advance() {
    if (isLast) router.replace('/(auth)/phone');
    else setCurrent((value) => value + 1);
  }

  return (
    <View className="flex-1 bg-ink px-6 pb-12 pt-16">
      <View className="flex-row items-center justify-between"><BrandMark inverse /><Text className="text-sm font-semibold text-slate-300">{current + 1} / {slides.length}</Text></View>
      <View className="flex-1 justify-center">
        <MotiView key={current} from={{ opacity: 0, translateX: 24 }} animate={{ opacity: 1, translateX: 0 }} transition={{ type: 'timing', duration: 420 }}>
          <View className="mb-10 h-28 w-28 items-center justify-center rounded-[36px] bg-brand shadow-xl"><Icon size={50} color="#FFFFFF" strokeWidth={2.1} /></View>
          <Text className="text-sm font-black tracking-[2px] text-orange-200">{item.eyebrow}</Text>
          <Text className="mt-3 text-4xl font-black leading-tight tracking-tight text-white">{item.title}</Text>
          <Text className="mt-4 max-w-sm text-base leading-7 text-slate-300">{item.text}</Text>
        </MotiView>
      </View>
      <View className="gap-6"><ProgressDots total={slides.length} current={current} /><AppButton label={isLast ? 'Criar a minha conta' : 'Continuar'} onPress={advance} /></View>
    </View>
  );
}
