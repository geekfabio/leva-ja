import { Text, View } from 'react-native';
import type { ReactNode } from 'react';
export function ProviderMetric({ label, value, icon }: { label: string; value: string; icon: ReactNode }) { return <View className="flex-1 rounded-2xl bg-white p-4 dark:bg-slate-900"><View className="mb-4 h-9 w-9 items-center justify-center rounded-xl bg-brand-soft">{icon}</View><Text className="text-xl font-black text-ink dark:text-white">{value}</Text><Text className="mt-1 text-xs text-muted">{label}</Text></View>; }
