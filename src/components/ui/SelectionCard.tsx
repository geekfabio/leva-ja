import { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { Check } from "lucide-react-native";
type Props = {
  role?: "radio" | "checkbox";
  title: string;
  description?: string;
  icon: ReactNode;
  selected: boolean;
  onPress: () => void;
};
export function SelectionCard({
  role = "radio",
  title,
  description,
  icon,
  selected,
  onPress,
}: Props) {
  return (
    <Pressable
      accessibilityRole={role}
      accessibilityLabel={title}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
      className={`min-h-24 flex-row items-center gap-4 rounded-3xl border p-4 ${selected ? "border-brand bg-brand-soft dark:bg-green-950" : "border-line bg-white dark:border-slate-800 dark:bg-slate-900"}`}
    >
      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-ink dark:text-white">
          {title}
        </Text>
        {description ? (
          <Text className="mt-1 text-sm leading-5 text-muted">
            {description}
          </Text>
        ) : null}
      </View>
      <View
        className={`h-6 w-6 items-center justify-center rounded-full border ${selected ? "border-brand bg-brand" : "border-slate-300"}`}
      >
        {selected ? <Check size={15} color="#FFFFFF" /> : null}
      </View>
    </Pressable>
  );
}
