import { useMemo, useRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Bike, ChevronRight, MapPin, ShoppingBag, UtensilsCrossed } from 'lucide-react-native';
import { MotiView } from 'moti';
import { AppButton } from '@/components/ui/AppButton';
import { OrderCard } from '@/components/orders/OrderCard';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { useOrderStore } from '@/stores/useOrderStore';

const shortcuts = [
  { label: 'Restaurantes', icon: UtensilsCrossed, color: '#FFF0EA' },
  { label: 'Mercado', icon: ShoppingBag, color: '#EEF2FF' },
  { label: 'Entrega', icon: Bike, color: '#ECFDF5' },
];

export default function HomeScreen() {
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['32%'], []);
  const { selectedOrder } = useOrderStore();

  return (
    <ScrollView className="flex-1 bg-surface dark:bg-slate-950" contentContainerClassName="px-5 pb-8 pt-16">
      <View className="mb-7 flex-row items-center justify-between">
        <View><Text className="text-sm text-muted">A entregar em</Text><View className="mt-1 flex-row items-center gap-1"><MapPin size={16} color="#FF5B26" /><Text className="font-bold text-ink dark:text-white">Ingombota, Luanda</Text></View></View>
        <View className="h-11 w-11 items-center justify-center rounded-full bg-brand"><Text className="font-bold text-white">AT</Text></View>
      </View>

      <MotiView from={{ opacity: 0, translateY: 16 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 550 }} className="mb-7 overflow-hidden rounded-3xl bg-ink p-6">
        <Text className="text-sm font-semibold text-orange-200">Entrega rápida</Text>
        <Text className="mt-2 text-3xl font-bold leading-tight text-white">O teu pedido{`\n`}chega já.</Text>
        <Text className="mb-5 mt-2 text-sm leading-5 text-slate-300">Explora restaurantes, mercados e serviços perto de ti.</Text>
        <AppButton label="Fazer pedido" icon={<ChevronRight size={18} color="white" />} onPress={() => sheetRef.current?.present()} />
      </MotiView>

      <View className="mb-7 flex-row gap-3">
        {shortcuts.map(({ label, icon: Icon, color }) => <View key={label} className="flex-1 items-center rounded-2xl bg-white px-2 py-4 dark:bg-slate-800"><View className="mb-2 rounded-full p-3" style={{ backgroundColor: color }}><Icon size={21} color="#FF5B26" /></View><Text className="text-center text-xs font-semibold text-ink dark:text-white">{label}</Text></View>)}
      </View>

      <SectionTitle title="Acompanhar pedido" />
      <OrderCard order={selectedOrder} onPress={() => router.push(`/order/${selectedOrder.id}`)} />

      <BottomSheetModal ref={sheetRef} snapPoints={snapPoints} enableDynamicSizing={false} backgroundStyle={{ backgroundColor: '#FFFFFF' }}>
        <View className="px-6"><Text className="text-xl font-bold text-ink">O que procuras?</Text><Text className="mb-5 mt-1 text-sm text-muted">Escolhe uma categoria para começares.</Text><AppButton label="Ver opções disponíveis" onPress={() => sheetRef.current?.dismiss()} /></View>
      </BottomSheetModal>
    </ScrollView>
  );
}
