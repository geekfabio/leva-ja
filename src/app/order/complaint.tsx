import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { AppButton } from '@/components/ui/AppButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
const options = ['Preço diferente do combinado', 'Problema com o serviço', 'Comportamento do prestador'];
export default function ComplaintScreen() { const [selected, setSelected] = useState(options[0]); return <View className="flex-1 bg-surface px-5 dark:bg-slate-950"><ScreenHeader title="Reportar um problema" subtitle="O suporte responderá neste pedido" /><View className="gap-3">{options.map((item) => <Pressable key={item} onPress={() => setSelected(item)} className={`rounded-2xl p-4 ${selected === item ? 'bg-brand-soft border border-brand' : 'bg-white dark:bg-slate-900'}`}><Text className="font-bold text-ink dark:text-white">{item}</Text></Pressable>)}<TextInput multiline placeholder="Adiciona detalhes (mock)" placeholderTextColor="#94A3B8" className="min-h-28 rounded-2xl bg-white p-4 text-ink dark:bg-slate-900 dark:text-white" /></View><View className="mt-auto pb-8"><AppButton label="Enviar para suporte" onPress={() => router.back()} /></View></View>; }
