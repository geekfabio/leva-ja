import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Bell, Bike, Pill, Search, ShoppingBasket, UtensilsCrossed } from 'lucide-react-native';
import { MotiView } from 'moti';
import { MerchantCard } from '@/components/commerce/MerchantCard';
import { ProductCard } from '@/components/commerce/ProductCard';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { merchants, products } from '@/mocks/commerce';
import { useCartStore } from '@/stores/useCartStore';

const categories = [
  { label: 'Restaurantes', route: '/category/restaurante', icon: UtensilsCrossed, tone: '#FFF0EA' },
  { label: 'Mercado', route: '/category/mercado', icon: ShoppingBasket, tone: '#EEF2FF' },
  { label: 'Farmácia', route: '/category/farmacia', icon: Pill, tone: '#ECFDF5' },
  { label: 'Entrega', route: '/category/entrega', icon: Bike, tone: '#FEF3C7' },
] as const;

export default function HomeScreen() {
  const add = useCartStore((state) => state.add);
  const count = useCartStore((state) => state.lines.reduce((total, line) => total + line.quantity, 0));
  return <View className="flex-1 bg-surface dark:bg-slate-950"><ScrollView contentContainerClassName="px-5 pb-28 pt-16"><View className="mb-6 flex-row items-center justify-between"><View><Text className="text-sm text-muted">Bom dia, Armando</Text><Text className="mt-1 text-xl font-black text-ink dark:text-white">O que vamos levar hoje?</Text></View><Pressable className="h-11 w-11 items-center justify-center rounded-2xl bg-white dark:bg-slate-900"><Bell size={20} color="#17212B" /></Pressable></View><Pressable onPress={() => router.push('/search')} className="mb-7 flex-row items-center gap-3 rounded-2xl bg-white px-4 py-4 dark:bg-slate-900"><Search size={20} color="#94A3B8" /><Text className="flex-1 text-sm text-muted">Pesquisar comida, lojas e produtos</Text></Pressable><MotiView from={{ opacity: 0, translateY: 12 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 450 }} className="mb-7 rounded-3xl bg-ink p-6"><Text className="text-sm font-black tracking-wide text-orange-200">ENTREGA RÁPIDA</Text><Text className="mt-2 text-3xl font-black leading-tight text-white">Pede agora.{`\n`}Recebe ainda hoje.</Text><Text className="mt-3 text-sm leading-5 text-slate-300">Descobre opções perto de ti em Ingombota.</Text></MotiView><SectionTitle title="Explorar" /><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-3 pb-7">{categories.map(({ label, route, icon: Icon, tone }) => <Pressable key={label} onPress={() => router.push(route)} className="w-24 items-center rounded-2xl bg-white px-2 py-4 dark:bg-slate-900"><View className="mb-2 rounded-2xl p-3" style={{ backgroundColor: tone }}><Icon size={22} color="#FF5B26" /></View><Text className="text-center text-xs font-bold text-ink dark:text-white">{label}</Text></Pressable>)}</ScrollView><SectionTitle title="Populares perto de ti" action="Ver tudo" />{merchants.slice(0, 2).map((merchant) => <MerchantCard key={merchant.id} merchant={merchant} onPress={() => router.push(`/merchant/${merchant.id}`)} />)}<SectionTitle title="Pedidos rápidos" />{products.slice(0, 3).map((product) => <ProductCard key={product.id} product={product} onPress={() => router.push(`/product/${product.id}`)} onAdd={() => add(product)} />)}</ScrollView>{count ? <Pressable onPress={() => router.push('/cart')} className="absolute bottom-5 left-5 right-5 flex-row items-center justify-between rounded-2xl bg-brand px-5 py-4"><Text className="font-black text-white">Ver carrinho ({count})</Text><Text className="text-sm font-bold text-orange-100">Continuar</Text></Pressable> : null}</View>;
}
