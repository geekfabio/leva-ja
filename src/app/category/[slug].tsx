import { ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MerchantCard } from '@/components/commerce/MerchantCard';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { merchants } from '@/mocks/commerce';
const labels: Record<string, string> = { restaurante: 'Restaurantes', mercado: 'Mercado', farmacia: 'Farmácia', entrega: 'Entregas' };
export default function CategoryScreen() { const { slug = 'restaurante' } = useLocalSearchParams<{ slug: string }>(); const title = labels[slug] ?? 'Explorar'; const items = slug === 'entrega' ? merchants : merchants.filter((merchant) => merchant.category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === slug); return <View className="flex-1 bg-surface px-5 dark:bg-slate-950"><ScreenHeader title={title} subtitle="Opções disponíveis perto de ti" /><ScrollView contentContainerClassName="pb-8">{items.map((merchant) => <MerchantCard key={merchant.id} merchant={merchant} onPress={() => router.push(`/merchant/${merchant.id}`)} />)}{!items.length ? <Text className="text-center text-muted">Novas opções estarão disponíveis em breve.</Text> : null}</ScrollView></View>; }
