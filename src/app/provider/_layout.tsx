import { Stack } from "expo-router";
import { View } from "react-native";
import { ProviderNav } from "@/components/provider/ProviderNav";
export default function ProviderLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false, animation: "fade" }} />
      <ProviderNav />
    </View>
  );
}
