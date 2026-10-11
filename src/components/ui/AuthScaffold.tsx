import { IconButton } from "./IconButton";
import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { BrandMark } from "@/components/ui/BrandMark";

type Props = {
  title: string;
  description: string;
  children: ReactNode;
  showBack?: boolean;
  footer?: ReactNode;
};

export function AuthScaffold({
  title,
  description,
  children,
  showBack = true,
  footer,
}: Props) {
  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-slate-950">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            padding: 24,
            width: "100%",
            maxWidth: 520,
            alignSelf: "center",
          }}
        >
          <View className="mb-10 flex-row items-center justify-between">
            {showBack ? (
              <IconButton
                label="Voltar"
                icon={<ChevronLeft size={22} color="#132A21" />}
                onPress={() =>
                  router.canGoBack()
                    ? router.back()
                    : router.replace("/welcome")
                }
              />
            ) : (
              <View className="w-12" />
            )}
            <BrandMark />
            <View className="w-12" />
          </View>
          <View className="mb-5 h-1 w-10 rounded-full bg-brand-bright" />
          <Text
            accessibilityRole="header"
            className="text-3xl font-bold leading-tight tracking-tight text-ink dark:text-white"
          >
            {title}
          </Text>
          <Text className="mt-3 text-base leading-6 text-muted">
            {description}
          </Text>
          <View className="mt-8 flex-1">{children}</View>
          {footer ? <View className="pt-6">{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
