import { Text, View } from 'react-native';
import { router as expoRouter, useLocalSearchParams } from 'expo-router';
import { Navigation } from 'lucide-react-native';
import { AppButton } from '@/components/ui/AppButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { MockMap } from '@/components/provider/MockMap';
import { useOrderStore } from '@/stores/useOrderStore';
const router = { replace: (path: string) => expoRouter.replace(path as never) };
export default function NavigationScreen() { const { id } = useLocalSearchParams<{ id: string }>(); const updateStatus = useOrderStore((state) => state.updateStatus); return <View className="flex-1 bg-surface px-5 dark:bg-slate-950"><ScreenHeader title="Navegação" subtitle="Rota simulada" /><MockMap label="Rua da Missão, Ingombota" detail="2,1 km · chegada em 7 min" /><View className="mt-5 rounded-3xl bg-white p-5 dark:bg-slate-900"><View className="flex-row items-center gap-3"><View className="rounded-2xl bg-brand-soft p-3"><Navigation size={24} color="#16A34A" /></View><View><Text className="font-black text-ink dark:text-white">Segue até ao cliente</Text><Text className="mt-1 text-sm text-muted">Depois será indicada a rota até à oficina.</Text></View></View></View><View className="mt-auto pb-8"><AppButton label="Cheguei ao local" onPress={() => { updateStatus(id, 'arrived'); router.replace(`/provider/request/${id}`); }} /></View></View>; }
