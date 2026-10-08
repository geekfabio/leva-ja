import { SafeAreaView, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { router } from 'expo-router';
import { ArrowRight, Bike, ShieldCheck, Sparkles } from 'lucide-react-native';
import { MotiView } from 'moti';
import { AppButton } from '@/components/ui/AppButton';
import { BrandMark } from '@/components/ui/BrandMark';

export default function WelcomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-slate-950">
      <View className="flex-1 justify-between px-6 pb-6 pt-4">
        <BrandMark />

        <View>
          <MotiView
            from={{ opacity: 0, translateY: 18, scale: 0.97 }}
            animate={{ opacity: 1, translateY: 0, scale: 1 }}
            transition={{ type: 'timing', duration: 600 }}
            className="mb-8 overflow-hidden rounded-3xl bg-ink p-6"
          >
            <View className="absolute -right-10 -top-9 h-36 w-36 rounded-full bg-brand/25" />
            <View className="absolute -bottom-14 left-8 h-32 w-32 rounded-full bg-orange-300/10" />
            <View className="mb-8 flex-row items-center justify-between">
              <View className="rounded-2xl bg-brand p-4"><Bike size={30} color="#FFFFFF" /></View>
              <View className="rounded-full bg-white/10 px-3 py-2"><Text className="text-xs font-bold text-orange-200">DISPONÍVEL EM LUANDA</Text></View>
            </View>
            <Text className="text-4xl font-black leading-tight tracking-tight text-white">O que precisas,{`\n`}chega até ti.</Text>
            <Text className="mt-3 max-w-xs text-base leading-6 text-slate-300">Pede refeições, compras e entregas sem complicação.</Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 16 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 550, delay: 180 }}
            className="gap-3"
          >
            <Benefit icon={<Sparkles size={18} color="#FF5B26" />} text="Uma experiência simples, do pedido à porta." />
            <Benefit icon={<ShieldCheck size={18} color="#FF5B26" />} text="Acompanhamento claro em cada etapa." />
          </MotiView>
        </View>

        <MotiView from={{ opacity: 0, translateY: 14 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 500, delay: 320 }}>
          <AppButton label="Começar agora" icon={<ArrowRight size={18} color="white" />} onPress={() => router.replace('/')} />
          <Text className="mt-4 text-center text-xs leading-5 text-muted">Ao continuar, aceitas os termos de utilização e a política de privacidade.</Text>
        </MotiView>
      </View>
    </SafeAreaView>
  );
}

function Benefit({ icon, text }: { icon: ReactNode; text: string }) {
  return <View className="flex-row items-center gap-3 rounded-2xl bg-white px-4 py-3 dark:bg-slate-900"><View className="rounded-xl bg-brand-soft p-2">{icon}</View><Text className="flex-1 text-sm font-medium leading-5 text-ink dark:text-white">{text}</Text></View>;
}
