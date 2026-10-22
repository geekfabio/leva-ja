import { Redirect, Stack } from "expo-router";
import { View } from "react-native";
import { LoadingState } from "@/components/core/States";
import { useProviderStore } from "@/stores/useProviderStore";
import { useSessionStore } from "@/stores/useSessionStore";
import { colors } from "@/theme/colors";
import { useScreenTransition, useStackOptions, webScreenLayout } from "@/components/core/ScreenTransitions";

const screenLayout = webScreenLayout((route) => (route.startsWith("partner/call") ? "fade" : "push"));

/** Área operacional do prestador. */
export default function ProviderLayout() {
  const options = useStackOptions("push");
  const fade = useScreenTransition("fade");
  const providerId = useSessionStore((s) => s.providerId);
  const ready = useProviderStore((s) => !!s.profile && s.providerId === providerId);
  // Sem prestador na sessão (modo API sem login): pede autenticação.
  if (!providerId) return <Redirect href={"/login" as never} />;
  // Os ecrãs só aparecem depois de o ProviderRepository devolver o perfil.
  if (!ready)
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: 80 }}>
        <LoadingState rows={4} label="A carregar a área do prestador" />
      </View>
    );
  return (
    <Stack screenOptions={options} screenLayout={screenLayout}>
      <Stack.Screen name="partner/(tabs)" />
      <Stack.Screen name="partner/call/[id]" options={{ ...fade, presentation: "fullScreenModal", gestureEnabled: false }} />
    </Stack>
  );
}
