import { Image, Pressable, Text, View } from 'react-native';
import { Clock3, MapPin } from 'lucide-react-native';
import type { Order } from '@/types/order';

const statusLabel = { preparing: 'A preparar', on_the_way: 'A caminho', delivered: 'Entregue' };

export function OrderCard({ order, onPress }: { order: Order; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} className="mb-3 flex-row overflow-hidden rounded-2xl bg-white dark:bg-slate-800" style={{ elevation: 1 }}>
      <Image source={{ uri: order.image }} className="h-28 w-28" />
      <View className="flex-1 justify-between p-3">
        <View>
          <View className="flex-row items-center justify-between gap-2">
            <Text className="flex-1 text-base font-bold text-ink dark:text-white" numberOfLines={1}>{order.merchant}</Text>
            <Text className="rounded-full bg-brand-soft px-2 py-1 text-xs font-semibold text-brand">{statusLabel[order.status]}</Text>
          </View>
          <Text className="mt-1 text-sm text-muted">{order.category} · {order.amount.toLocaleString('pt-PT')} Kz</Text>
        </View>
        <View className="flex-row gap-3">
          <View className="flex-row items-center gap-1"><Clock3 size={14} color="#FF5B26" /><Text className="text-xs text-muted">{order.etaMinutes} min</Text></View>
          <View className="flex-1 flex-row items-center gap-1"><MapPin size={14} color="#FF5B26" /><Text className="flex-1 text-xs text-muted" numberOfLines={1}>{order.address}</Text></View>
        </View>
      </View>
    </Pressable>
  );
}
