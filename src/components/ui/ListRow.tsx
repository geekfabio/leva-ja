import { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
export function ListRow({
  title,
  description,
  icon,
  onPress,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      disabled={!onPress}
      onPress={onPress}
      className="min-h-20 flex-row items-center gap-3 rounded-2xl border border-line bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
    >
      {icon}
      <View className="flex-1">
        <Text className="text-base font-semibold text-ink dark:text-white">
          {title}
        </Text>
        {description ? (
          <Text className="mt-1 text-sm leading-5 text-muted">
            {description}
          </Text>
        ) : null}
      </View>
      {onPress ? <ChevronRight size={20} color="#64746C" /> : null}
    </Pressable>
  );
}
