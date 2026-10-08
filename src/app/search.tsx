import { useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { Search } from 'lucide-react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ProductCard } from '@/components/commerce/ProductCard';
import { products } from '@/mocks/commerce';
import { useCartStore } from '@/stores/useCartStore';

export default function SearchScreen() {
  const [query, setQuery] = useState(''); const add = useCartStore((state) => state.add);
  const results = useMemo(() => products.filter((product) => product.name.toLowerCase().includes(query.toLowerCase()) || product.description.toLowerCase().includes(query.toLowerCase())), [query]);
  return <View className="flex-1 bg-surface px-5 dark:bg-slate-950"><ScreenHeader title="Pesquisar" subtitle="Encontra exactamente o que precisas" /><View className="mb-6 flex-row items-center gap-3 rounded-2xl bg-white px-4 py-1 dark:bg-slate-900"><Search size={20} color="#94A3B8" /><TextInput value={query} onChangeText={setQuery} autoFocus placeholder="Ex.: frango, mercado, farmácia" className="flex-1 py-4 text-base text-ink dark:text-white" placeholderTextColor="#94A3B8" /></View><ScrollView contentContainerClassName="pb-8">{query ? <Text className="mb-3 text-sm text-muted">{results.length} resultado(s)</Text> : <Text className="mb-3 text-sm text-muted">Sugestões para ti</Text>}{results.map((product) => <ProductCard key={product.id} product={product} onAdd={() => add(product)} />)}</ScrollView></View>;
}
