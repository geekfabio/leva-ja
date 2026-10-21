import { Stack } from "expo-router";

/** Área do cliente: separadores, formulário de pedido, acompanhamento e conta. */
export default function ClientLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="trip/call" options={{ animation: "fade", presentation: "fullScreenModal" }} />
      <Stack.Screen name="sos" options={{ presentation: "modal" }} />
    </Stack>
  );
}
