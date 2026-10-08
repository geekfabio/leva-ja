import { Text, View } from 'react-native';

export function SectionTitle({ title, action }: { title: string; action?: string }) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <Text className="text-xl font-bold text-ink dark:text-white">{title}</Text>
      {action ? <Text className="font-semibold text-brand">{action}</Text> : null}
    </View>
  );
}
