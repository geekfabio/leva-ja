import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AlertTriangle } from 'lucide-react-native';
import { AppButton } from '@/components/ui/AppButton';
import { useOrderStore } from '@/stores/useOrderStore';
const reasons = ['Já não preciso de assistência', 'Indiquei a localização errada', 'Demora demasiado tempo'];
export default function CancelScreen() { const [reason, setReason] = useState(reasons[0]); const { selectedOrder, cancelOrder } = useOrderStore(); return <View className="flex-1 justify-between bg-surface px-6 pb-10 pt-20 dark:bg-slate-950"><View><AlertTriangle size={40} color="#DC2626" /><Text className="mt-6 text-3xl font-black text-ink dark:text-white">Cancelar pedido?</Text><Text className="mt-3 text-base leading-6 text-muted">Se o reboque já se deslocou, poderá aplicar-se uma taxa de cancelamento. Isto é apenas uma simulação.</Text><View className="mt-7 gap-3">{reasons.map((item) => <Pressable key={item} onPress={() => setReason(item)} className={`rounded-2xl p-4 ${reason === item ? 'bg-red-50 border border-red-300' : 'bg-white dark:bg-slate-900'}`}><Text className="font-bold text-ink dark:text-white">{item}</Text></Pressable>)}</View></View><View className="gap-3"><AppButton label="Confirmar cancelamento" onPress={() => { cancelOrder(selectedOrder.id); router.replace(`/order/${selectedOrder.id}`); }} /><AppButton label="Manter pedido" variant="ghost" onPress={() => router.back()} /></View></View>; }
