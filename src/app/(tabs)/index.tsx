import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { BatteryCharging, Bell, CarFront, CircleHelp, Fuel, MapPin, ShieldCheck, Wrench } from 'lucide-react-native';
import { MotiView } from 'moti';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { BrandMark } from '@/components/ui/BrandMark';
import { useOrderStore } from '@/stores/useOrderStore';

const services = [
  { label: 'Reboque', hint: 'Levar a viatura', icon: CarFront },
  { label: 'Bateria', hint: 'Sem carga', icon: BatteryCharging },
  { label: 'Pneu', hint: 'Furo ou troca', icon: Wrench },
  { label: 'Combustível', hint: 'Entrega no local', icon: Fuel },
] as const;

export default function HomeScreen() {
  const active = useOrderStore((state) => state.orders.find((item) => item.status === 'on_the_way'));
  return (
    <View className="flex-1 bg-surface dark:bg-slate-950">
      <ScrollView contentContainerClassName="px-5 pb-28 pt-16">
        <View className="mb-7 flex-row items-center justify-between">
          <View><Text className="text-sm text-muted">Olá, Armando</Text><Text className="mt-1 text-2xl font-black text-ink dark:text-white">Como te ajudamos?</Text></View>
          <View className="flex-row items-center gap-3"><BrandMark compact /><Pressable accessibilityLabel="Notificações" className="h-11 w-11 items-center justify-center rounded-2xl bg-white dark:bg-slate-900"><Bell size={20} color="#102018" /></Pressable></View>
        </View>
        <MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 450 }} className="mb-7 overflow-hidden rounded-[30px] bg-ink p-6">
          <View className="absolute -right-8 -top-9 h-40 w-40 rounded-full bg-brand/30" />
          <View className="mb-6 flex-row items-center justify-between"><View className="rounded-2xl bg-brand p-3"><CarFront size={28} color="#fff" /></View><View className="rounded-full bg-white/10 px-3 py-2"><Text className="text-xs font-black text-green-200">24H EM LUANDA</Text></View></View>
          <Text className="text-3xl font-black leading-tight text-white">Assistência para{`\n`}a tua viatura.</Text>
          <Text className="mt-3 max-w-xs text-sm leading-6 text-slate-300">Pede reboque ou ajuda no local. Acompanha tudo em tempo real.</Text>
          <Pressable onPress={() => router.push('/request/service')} className="mt-6 self-start rounded-2xl bg-brand px-5 py-4"><Text className="font-black text-white">Pedir assistência</Text></Pressable>
        </MotiView>
        {active ? <Pressable onPress={() => router.push(`/order/${active.id}`)} className="mb-7 rounded-3xl border border-green-100 bg-white p-5 dark:border-green-950 dark:bg-slate-900"><View className="flex-row items-center gap-2"><View className="h-2 w-2 rounded-full bg-brand" /><Text className="text-xs font-black tracking-wide text-brand">ASSISTÊNCIA ACTIVA</Text></View><Text className="mt-3 text-lg font-black text-ink dark:text-white">{active.provider} está a caminho</Text><View className="mt-3 flex-row items-center gap-2"><MapPin size={16} color="#16A34A" /><Text className="flex-1 text-sm text-muted">{active.etaMinutes} min · {active.address}</Text></View></Pressable> : null}
        <SectionTitle title="Que problema tens?" />
        <View className="mb-7 grid grid-cols-2 gap-3">{services.map(({ label, hint, icon: Icon }) => <Pressable key={label} onPress={() => router.push('/request/service')} className="rounded-3xl bg-white p-4 dark:bg-slate-900"><View className="mb-5 h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft"><Icon size={23} color="#16A34A" /></View><Text className="font-black text-ink dark:text-white">{label}</Text><Text className="mt-1 text-xs text-muted">{hint}</Text></Pressable>)}</View>
        <SectionTitle title="Porquê Leva Já?" />
        <View className="gap-3"><Benefit icon={<ShieldCheck size={19} color="#16A34A" />} title="Prestadores verificados" text="Apoio de profissionais qualificados." /><Benefit icon={<CircleHelp size={19} color="#16A34A" />} title="Acompanhamento claro" text="Vês cada passo da assistência." /></View>
      </ScrollView>
    </View>
  );
}

function Benefit({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return <View className="flex-row gap-3 rounded-2xl bg-white p-4 dark:bg-slate-900"><View className="h-10 w-10 items-center justify-center rounded-xl bg-brand-soft">{icon}</View><View className="flex-1"><Text className="font-bold text-ink dark:text-white">{title}</Text><Text className="mt-1 text-sm text-muted">{text}</Text></View></View>;
}
