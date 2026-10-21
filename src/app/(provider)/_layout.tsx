import { Stack } from "expo-router";
import { useScreenTransition, useStackOptions, webScreenLayout } from "@/components/core/ScreenTransitions";

const screenLayout = webScreenLayout((route) => (route.startsWith("partner/call") ? "fade" : "push"));

/** Área operacional do prestador. */
export default function ProviderLayout() {
  const options = useStackOptions("push");
  const fade = useScreenTransition("fade");
  return (
    <Stack screenOptions={options} screenLayout={screenLayout}>
      <Stack.Screen name="partner/(tabs)" />
      <Stack.Screen name="partner/call/[id]" options={{ ...fade, presentation: "fullScreenModal", gestureEnabled: false }} />
    </Stack>
  );
}
