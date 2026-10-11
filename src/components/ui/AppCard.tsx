import { PropsWithChildren } from "react";
import { View, ViewProps } from "react-native";

export function AppCard({
  children,
  className = "",
  ...props
}: PropsWithChildren<ViewProps & { className?: string }>) {
  return (
    <View
      {...props}
      className={`rounded-3xl border border-line bg-white p-5 dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      {children}
    </View>
  );
}
