import { View } from 'react-native';

export function ProgressDots({ total, current }: { total: number; current: number }) {
  return <View className="flex-row gap-2">{Array.from({ length: total }).map((_, index) => <View key={index} className={`h-2 rounded-full ${index === current ? 'w-7 bg-brand' : 'w-2 bg-slate-200 dark:bg-slate-700'}`} />)}</View>;
}
