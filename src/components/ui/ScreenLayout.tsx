import { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenHeader } from "./ScreenHeader";
import { BottomAction } from "./BottomAction";
export function ScreenLayout({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      className="bg-surface dark:bg-slate-950"
    >
      <View className="px-5">
        <ScreenHeader title={title} subtitle={subtitle} />
      </View>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: action ? 120 + insets.bottom : 24 + insets.bottom,
        }}
      >
        <View className="gap-5">{children}</View>
      </ScrollView>
      {action ? <BottomAction>{action}</BottomAction> : null}
    </KeyboardAvoidingView>
  );
}
