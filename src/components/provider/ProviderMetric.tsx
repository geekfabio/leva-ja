import { Text, View } from "react-native";
import type { ReactNode } from "react";
export function ProviderMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <View
      style={{ flex: 1, minWidth: 120 }}
      className="rounded-3xl border border-line bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
    >
      <View className="mb-4 h-10 w-10 items-center justify-center rounded-xl bg-brand-soft">
        {icon}
      </View>
      <Text className="text-xl font-bold tracking-tight text-ink dark:text-white">
        {value}
      </Text>
      <Text className="mt-1 text-sm text-muted">{label}</Text>
    </View>
  );
}
