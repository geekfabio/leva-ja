import { Image, Pressable, Text, View } from 'react-native';
import { Clock3, Star } from 'lucide-react-native';
import type { Merchant } from '@/types/commerce';

export function MerchantCard({ merchant, onPress }: { merchant: Merchant; onPress?: () => void }) {
  return <Pressable onPress={onPress} className="mb-4 overflow-hidden rounded-3xl bg-white dark:bg-slate-900" style={{ elevation: 1 }}><Image source={{ uri: merchant.image }} className="h-36 w-full" /><View className="p-4"><View className="flex-row items-start justify-between gap-3"><View className="flex-1"><Text className="text-lg font-black text-ink dark:text-white">{merchant.name}</Text><Text className="mt-1 text-sm text-muted">{merchant.category}</Text></View><View className="rounded-full px-2 py-1" style={{ backgroundColor: merchant.accent }}><Text className="text-xs font-black text-ink">Aberto</Text></View></View><View className="mt-4 flex-row gap-4"><View className="flex-row items-center gap-1"><Star size={15} fill="#F59E0B" color="#F59E0B" /><Text className="text-xs font-bold text-ink dark:text-white">{merchant.rating}</Text></View><View className="flex-row items-center gap-1"><Clock3 size={15} color="#FF5B26" /><Text className="text-xs font-medium text-muted">{merchant.eta}</Text></View></View></View></Pressable>;
}
