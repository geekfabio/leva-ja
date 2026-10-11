import { ReactNode } from "react";
import { Pressable } from "react-native";
export function IconButton({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
      className="h-12 w-12 items-center justify-center rounded-full border border-line bg-white"
    >
      {icon}
    </Pressable>
  );
}
