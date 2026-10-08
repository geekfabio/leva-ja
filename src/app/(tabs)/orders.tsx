import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { OrderCard } from '@/components/orders/OrderCard';
import { useOrderStore } from '@/stores/useOrderStore';

export default function OrdersScreen() {
  const { orders, selectOrder } = useOrderStore();
  return <View className="flex-1 bg-surface px-5 pt-16 dark:bg-slate-950"><Text className="mb-1 text-3xl font-black text-ink dark:text-white">Assistências</Text><Text className="mb-6 text-muted">Acompanha pedidos activos e o teu histórico.</Text><FlashList data={orders} estimatedItemSize={112} renderItem={({ item }) => <OrderCard order={item} onPress={() => { selectOrder(item.id); router.push(`/order/${item.id}`); }} />} /></View>;
}
