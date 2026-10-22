import { Stack } from "expo-router";
import { useScreenTransition, useStackOptions, webScreenLayout, type TransitionKind } from "@/components/core/ScreenTransitions";

/** Ecrãs trocados pela mudança de estado do serviço: esbatem em vez de deslizar. */
const statusScreens = ["trip/matching", "trip/found", "trip/arrived", "trip/in-transit", "trip/payment", "trip/receipt"];
const modalScreens = ["trip/call", "sos"];
const kindFor = (route: string): TransitionKind => (statusScreens.includes(route) || route === "trip/call" ? "fade" : route === "sos" ? "modal" : "push");
const screenLayout = webScreenLayout(kindFor);

/** Área do cliente: separadores, formulário de pedido, acompanhamento e conta. */
export default function ClientLayout() {
  const options = useStackOptions("push");
  const fade = useScreenTransition("fade");
  const modal = useScreenTransition("modal");
  return (
    <Stack screenOptions={options} screenLayout={screenLayout}>
      <Stack.Screen name="(tabs)" />
      {statusScreens.map((name) => (
        <Stack.Screen key={name} name={name} options={fade} />
      ))}
      <Stack.Screen name={modalScreens[0]} options={{ ...fade, presentation: "fullScreenModal", gestureEnabled: false }} />
      <Stack.Screen name={modalScreens[1]} options={{ ...modal, presentation: "modal" }} />
    </Stack>
  );
}
