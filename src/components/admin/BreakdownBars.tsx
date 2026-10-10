import { Text, View } from 'react-native';

type Item = { label: string; value: number; color: string; detail?: string };

export function BreakdownBars({ title, subtitle, items }: { title: string; subtitle?: string; items: Item[] }) {
  return (
    <View className="rounded-3xl bg-white p-5 dark:bg-slate-900">
      <Text className="text-lg font-black text-ink dark:text-white">{title}</Text>
      {subtitle ? <Text className="mt-1 text-sm text-muted">{subtitle}</Text> : null}
      <View className="mt-5 gap-4">
        {items.map((item) => (
          <View key={item.label}>
            <View className="flex-row items-center justify-between">
              <Text className="font-bold text-ink dark:text-white">{item.label}</Text>
              <Text className="text-sm font-black text-muted">{item.value}%{item.detail ? ` · ${item.detail}` : ''}</Text>
            </View>
            <View className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <View className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
