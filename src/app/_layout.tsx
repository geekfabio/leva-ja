import "react-native-gesture-handler";
import "../../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Platform, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import ToastMessage from "react-native-toast-message";
import { AppProviders } from "@/providers/AppProviders";
import { toastConfig } from "@/components/ui/AppToast";
import { fontAssets } from "@/theme/fonts";
import { useScreenTransition, useStackOptions, webScreenLayout, type TransitionKind } from "@/components/core/ScreenTransitions";

// Mudanças de área (splash, acesso, cliente, prestador) esbatem; o resto desliza.
const areaRoutes = ["index", "(auth)", "(client)", "(provider)"];
const rootKind = (route: string): TransitionKind => (areaRoutes.includes(route) ? "fade" : "push");
const rootScreenLayout = webScreenLayout(rootKind);

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const stackOptions = useStackOptions("push");
  const fade = useScreenTransition("fade");

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync().catch(() => undefined);
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <AppProviders>
      <StatusBar style="dark" />
      <View style={{ flex: 1, backgroundColor: "#E9EEEA" }}>
        <View
          style={{
            flex: 1,
            width: "100%",
            alignSelf: "center",
            maxWidth: Platform.OS === "web" ? 520 : undefined,
          }}
        >
          <Stack screenOptions={{ ...stackOptions, contentStyle: { backgroundColor: "#F8F9F7" } }} screenLayout={rootScreenLayout}>
            <Stack.Screen name="index" options={fade} />
            <Stack.Screen name="(auth)" options={fade} />
            <Stack.Screen name="(client)" options={fade} />
            <Stack.Screen name="(provider)" options={fade} />
          </Stack>
        </View>
      </View>
      <ToastMessage config={toastConfig} topOffset={56} />
    </AppProviders>
  );
}
