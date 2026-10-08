import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

export function ScreenHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return <View className="mb-6 flex-row items-center gap-3 pt-3"><Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-2xl bg-white dark:bg-slate-900"><ChevronLeft size={22} color="#17212B" /></Pressable><View><Text className="text-xl font-black text-ink dark:text-white">{title}</Text>{subtitle ? <Text className="mt-0.5 text-xs text-muted">{subtitle}</Text> : null}</View></View>;
}
