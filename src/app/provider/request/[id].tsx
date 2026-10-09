import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Camera, MessageCircle, Phone, ShieldCheck } from 'lucide-react-native';
import { AppButton } from '@/components/ui/AppButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { MockMap } from '@/components/provider/MockMap';
import { ProviderStatusPill } from '@/components/provider/ProviderStatusPill';
import { useOrderStore } from '@/stores/useOrderStore';
import type { OrderStatus } from '@/types/order';

const next: Partial<Record<OrderStatus, [OrderStatus, string]>> = { matching: ['accepted', 'Aceitar pedido'], accepted: ['on_the_way', 'Iniciar deslocação'], on_the_way: ['arrived', 'Confirmar chegada'], arrived: ['service_started', 'Confirmar recolha'], service_started: ['completed', 'Concluir serviço'] };
export default function ProviderRequest() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders, selectedOrder, updateStatus } = useOrderStore();
  const order = orders.find((item) => item.id === id) ?? selectedOrder;
  const action = next[order.status];
  return <View className="flex-1 bg-surface px-5 dark:bg-slate-950"><ScreenHeader title="Detalhe do pedido" subtitle={order.id} /><ScrollView contentContainerClassName="pb-28"><MockMap label={order.address} detail="2,1 km · 7 min até ao cliente" /><View className="mt-5 rounded-3xl bg-white p-5 dark:bg-slate-900"><ProviderStatusPill status={order.status} /><Text className="mt-3 text-xl font-black text-ink dark:text-white">{order.category}</Text><Text className="mt-1 text-sm text-muted">{order.vehicle} · Cliente: Armando Trindade</Text><View className="my-4 h-px bg-slate-100 dark:bg-slate-800" /><Text className="font-bold text-ink dark:text-white">Notas do cliente</Text><Text className="mt-2 text-sm leading-6 text-muted">{order.incidentNote ?? 'Motor desligou durante a condução.'}</Text><Text className="mt-4 font-bold text-ink dark:text-white">Destino</Text><Text className="mt-1 text-sm text-muted">{order.destination ?? 'Oficina Auto Centro, Maianga'}</Text><View className="mt-4 flex-row gap-2"><Pressable onPress={() => router.push('/order/chat')} className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-brand-soft py-3"><MessageCircle size={18} color="#16A34A" /><Text className="font-black text-brand">Chat</Text></Pressable><Pressable onPress={() => router.push('/order/call')} className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-brand-soft py-3"><Phone size={18} color="#16A34A" /><Text className="font-black text-brand">Chamar</Text></Pressable></View></View><View className="mt-5 flex-row gap-3"><Proof label="Fotos" icon={<Camera size={19} color="#16A34A" />} /><Proof label="Verificação" icon={<ShieldCheck size={19} color="#16A34A" />} /></View></ScrollView><View className="absolute bottom-0 left-0 right-0 border-t border-slate-100 bg-surface px-5 pb-7 pt-4 dark:border-slate-800 dark:bg-slate-950">{action ? <AppButton label={action[1]} onPress={() => { updateStatus(order.id, action[0]); if (action[0] === 'on_the_way') router.push(`/provider/navigation/${order.id}` as never); }} /> : <AppButton label="Ver serviços concluídos" onPress={() => router.push('/provider/earnings' as never)} />}</View></View>;
}
function Proof({ label, icon }: { label: string; icon: ReactNode }) { return <View className="flex-1 items-center rounded-2xl bg-white p-4 dark:bg-slate-900">{icon}<Text className="mt-2 text-xs font-bold text-muted">{label} mock</Text></View>; }
