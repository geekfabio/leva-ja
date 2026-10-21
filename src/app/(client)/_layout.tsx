import { Stack } from "expo-router";

/** Área do cliente: separadores, formulário de pedido, acompanhamento e conta. */
export default function ClientLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="(tabs)" />
      {/* Ecrãs trocados pela mudança de estado do serviço: transição suave em vez de deslizar. */}
      {["trip/matching", "trip/found", "trip/arrived", "trip/in-transit", "trip/payment", "trip/receipt"].map((name) => (
        <Stack.Screen key={name} name={name} options={{ animation: "fade_from_bottom" }} />
      ))}
      <Stack.Screen name="trip/call" options={{ animation: "fade", presentation: "fullScreenModal" }} />
      <Stack.Screen name="sos" options={{ presentation: "modal" }} />
    </Stack>
  );
}
