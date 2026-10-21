import { Stack } from "expo-router";
import { View } from "react-native";
import { ProviderNav } from "@/components/provider/ProviderNav";
import { useStackOptions, webScreenLayout } from "@/components/core/ScreenTransitions";
const screenLayout = webScreenLayout("fade");

export default function ProviderLayout() {
  const options = useStackOptions("fade");
  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={options} screenLayout={screenLayout} />
      <ProviderNav />
    </View>
  );
}
