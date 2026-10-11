import { Text, View } from "react-native";
import { AppButton } from "./AppButton";
export function StateMessage({
  title,
  description,
  action,
  onPress,
}: {
  title: string;
  description: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <View className="rounded-3xl border border-line bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <Text
        accessibilityRole="header"
        className="text-xl font-bold text-ink dark:text-white"
      >
        {title}
      </Text>
      <Text className="mt-2 text-base leading-6 text-muted">{description}</Text>
      {action ? (
        <View className="mt-5">
          <AppButton label={action} onPress={onPress} />
        </View>
      ) : null}
    </View>
  );
}
