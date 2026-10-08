import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { BatteryCharging, CarFront, CircleAlert, Fuel, Wrench } from 'lucide-react-native';
import { AppButton } from '@/components/ui/AppButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';

const options = [
  { id: 'tow', title: 'Reboque de viatura', description: 'Levar a viatura para uma oficina ou outro local.', icon: CarFront },
  { id: 'battery', title: 'Bateria descarregada', description: 'Ajuda para dar carga ou substituir a bateria.', icon: BatteryCharging },
  { id: 'tire', title: 'Pneu furado', description: 'Troca de pneu ou assistência no local.', icon: Wrench },
  { id: 'fuel', title: 'Falta de combustível', description: 'Entrega de combustível onde estás.', icon: Fuel },
  { id: 'other', title: 'Outro problema', description: 'Explica-nos o que aconteceu.', icon: CircleAlert },
];

export default function ServiceScreen() {
  const [selected, setSelected] = useState('tow');
  return <View className="flex-1 bg-surface px-5 dark:bg-slate-950"><ScreenHeader title="O que aconteceu?" subtitle="Passo 1 de 4" /><ScrollView contentContainerClassName="pb-28"><Text className="mb-6 text-base leading-6 text-muted">Escolhe o tipo de assistência para encontrarmos o profissional certo.</Text><View className="gap-3">{options.map(({ id, title, description, icon: Icon }) => { const active = id === selected; return <Pressable key={id} accessibilityRole="radio" accessibilityState={{ selected: active }} onPress={() => setSelected(id)} className={`flex-row items-center gap-4 rounded-3xl border p-4 ${active ? 'border-brand bg-brand-soft' : 'border-transparent bg-white dark:bg-slate-900'}`}><View className={`h-12 w-12 items-center justify-center rounded-2xl ${active ? 'bg-brand' : 'bg-slate-100 dark:bg-slate-800'}`}><Icon size={23} color={active ? '#FFFFFF' : '#16A34A'} /></View><View className="flex-1"><Text className="font-black text-ink dark:text-white">{title}</Text><Text className="mt-1 text-xs leading-5 text-muted">{description}</Text></View><View className={`h-5 w-5 rounded-full border-2 ${active ? 'border-brand bg-brand' : 'border-slate-300'}`} /></Pressable>; })}</View></ScrollView><View className="absolute bottom-0 left-0 right-0 border-t border-slate-100 bg-surface px-5 pb-7 pt-4 dark:border-slate-800 dark:bg-slate-950"><AppButton label="Continuar" onPress={() => router.push('/request/vehicle')} /></View></View>;
}
