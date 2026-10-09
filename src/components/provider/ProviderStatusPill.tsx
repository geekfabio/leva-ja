import { Text, View } from 'react-native';
import type { OrderStatus } from '@/types/order';

const labels: Partial<Record<OrderStatus, string>> = { matching: 'DISPONÍVEL', accepted: 'ACEITE', on_the_way: 'A CAMINHO', arrived: 'NO LOCAL', service_started: 'EM SERVIÇO', completed: 'CONCLUÍDO', cancelled: 'CANCELADO' };
export function ProviderStatusPill({ status }: { status: OrderStatus }) { return <View className="self-start rounded-full bg-brand-soft px-3 py-1.5"><Text className="text-[10px] font-black tracking-wide text-brand">{labels[status] ?? 'DISPONÍVEL'}</Text></View>; }
