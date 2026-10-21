import { Stack } from "expo-router";

/** Área operacional do prestador. */
export default function ProviderLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="partner/(tabs)" />
      <Stack.Screen name="partner/call/[id]" options={{ animation: "fade", presentation: "fullScreenModal" }} />
    </Stack>
  );
}
