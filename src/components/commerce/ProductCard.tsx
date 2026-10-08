import { Image, Pressable, Text, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import type { Product } from '@/types/commerce';

export function ProductCard({ product, onPress, onAdd }: { product: Product; onPress?: () => void; onAdd?: () => void }) {
  return <Pressable onPress={onPress} className="mb-3 flex-row overflow-hidden rounded-2xl bg-white dark:bg-slate-900" style={{ elevation: 1 }}><Image source={{ uri: product.image }} className="h-28 w-28" /><View className="flex-1 justify-between p-3"><View><View className="flex-row items-center justify-between gap-2"><Text className="flex-1 text-base font-black text-ink dark:text-white" numberOfLines={1}>{product.name}</Text>{product.tag ? <Text className="rounded-full bg-brand-soft px-2 py-1 text-[10px] font-black text-brand">{product.tag}</Text> : null}</View><Text className="mt-1 text-xs leading-5 text-muted" numberOfLines={2}>{product.description}</Text></View><View className="flex-row items-center justify-between"><Text className="font-black text-ink dark:text-white">{product.price.toLocaleString('pt-PT')} Kz</Text><Pressable onPress={onAdd} className="h-9 w-9 items-center justify-center rounded-xl bg-brand"><Plus size={18} color="#FFFFFF" /></Pressable></View></View></Pressable>;
}
