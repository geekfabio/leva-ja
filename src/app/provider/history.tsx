import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Pressable } from 'react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
const rows = [['LJ-2590', 'Bateria descarregada', '9.500 Kz'], ['LJ-2548', 'Pneu furado', '7.000 Kz'], ['LJ-2519', 'Reboque de viatura', '18.500 Kz']];
export default function ProviderHistory() { return <View className="flex-1 bg-surface px-5 dark:bg-slate-950"><ScreenHeader title="Histórico de serviços" subtitle="Concluídos e pagos" /><ScrollView>{rows.map(([id, title, value]) => <Pressable onPress={() => router.push(`/provider/request/${id}` as never)} key={id} className="mb-3 rounded-2xl bg-white p-4 dark:bg-slate-900"><Text className="font-black text-ink dark:text-white">{title}</Text><Text className="mt-1 text-sm text-muted">{id} · Concluído</Text><Text className="mt-3 font-black text-brand">{value}</Text></Pressable>)}</ScrollView></View>; }
