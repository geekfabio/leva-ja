import { Image, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, CircleCheck, MapPin, Phone } from 'lucide-react-native';
import { AppButton } from '@/components/ui/AppButton';
import { useOrderStore } from '@/stores/useOrderStore';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = useOrderStore((state) => state.orders.find((item) => item.id === id) ?? state.selectedOrder);
  return <View className="flex-1 bg-surface dark:bg-slate-950"><Image source={{ uri: order.image }} className="h-72 w-full" /><View className="absolute left-5 top-14"><AppButton label="Voltar" variant="ghost" onPress={() => router.back()} icon={<ChevronLeft size={18} color="#FF5B26" />} /></View><View className="-mt-6 flex-1 rounded-t-3xl bg-surface px-5 pt-7 dark:bg-slate-950"><View className="mb-4 flex-row items-start justify-between"><View><Text className="text-2xl font-bold text-ink dark:text-white">{order.merchant}</Text><Text className="mt-1 text-muted">Pedido {order.id}</Text></View><Text className="rounded-full bg-green-100 px-3 py-2 text-sm font-bold text-green-700">{order.etaMinutes} min</Text></View><View className="mb-6 rounded-2xl bg-white p-4 dark:bg-slate-800"><View className="flex-row items-center gap-3"><CircleCheck size={22} color="#16A34A" /><View><Text className="font-bold text-ink dark:text-white">Entregador a caminho</Text><Text className="text-sm text-muted">Estamos quase a chegar.</Text></View></View><View className="my-4 h-px bg-slate-100 dark:bg-slate-700" /><View className="flex-row items-center gap-3"><MapPin size={20} color="#FF5B26" /><Text className="flex-1 text-sm text-muted">{order.address}</Text></View></View><AppButton label="Contactar entregador" icon={<Phone size={18} color="white" />} /></View></View>;
}
