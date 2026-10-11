import { PropsWithChildren } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function BottomAction({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{ paddingBottom: Math.max(insets.bottom, 20) }}
      className="absolute bottom-0 left-0 right-0 border-t border-line bg-surface px-5 pt-4 dark:border-slate-800 dark:bg-slate-950"
    >
      {children}
    </View>
  );
}
