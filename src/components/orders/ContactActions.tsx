import { View } from "react-native";
import { router } from "expo-router";
import { AppButton } from "@/components/ui/AppButton";
export function ContactActions() {
  return (
    <View className="flex-row gap-3">
      <View className="flex-1">
        <AppButton
          label="Mensagem"
          variant="ghost"
          onPress={() => router.push("/order/chat")}
        />
      </View>
      <View className="flex-1">
        <AppButton
          label="Chamar"
          variant="ghost"
          onPress={() => router.push("/order/call")}
        />
      </View>
    </View>
  );
}
