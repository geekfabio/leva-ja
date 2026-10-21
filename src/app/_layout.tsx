import "react-native-gesture-handler";
import "../../global.css";
import { useEffect } from "react";
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Platform, View, useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import ToastMessage from "react-native-toast-message";
import { AppProviders } from "@/providers/AppProviders";
import { toastConfig } from "@/components/ui/AppToast";
import { fontAssets } from "@/theme/fonts";
import { useScreenTransition, useStackOptions, webScreenLayout, type TransitionKind } from "@/components/core/ScreenTransitions";

// Mudanças de área (splash, acesso, cliente, prestador) esbatem; o resto desliza.
const areaRoutes = ["index", "(auth)", "(client)", "(provider)", "legacy", "admin"];
const rootKind = (route: string): TransitionKind => (areaRoutes.includes(route) ? "fade" : route === "order/[id]" ? "modal" : "push");
const rootScreenLayout = webScreenLayout(rootKind);

SplashScreen.preventAutoHideAsync().catch(() => undefined);

/** Ecrãs legados (protótipo anterior) mantêm o tema escuro automático; a nova experiência é clara. */
const legacyPrefixes = ["/legacy", "/request", "/transport", "/order", "/provider", "/admin", "/demo", "/ui-kit", "/merchant", "/product", "/cart", "/checkout", "/category", "/search", "/notifications", "/support", "/welcome", "/phone", "/otp", "/address", "/location", "/onboarding"];

export default function RootLayout() {
  const path = usePathname();
  const scheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const stackOptions = useStackOptions("push");
  const fade = useScreenTransition("fade");
  const modal = useScreenTransition("modal");
  const legacy = legacyPrefixes.some((p) => path === p || path.startsWith(`${p}/`));
  const dark = legacy && scheme === "dark";

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync().catch(() => undefined);
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <AppProviders>
      <StatusBar style={dark ? "light" : "dark"} />
      <View style={{ flex: 1, backgroundColor: dark ? "#0F172A" : "#E9EEEA" }}>
        <View
          style={{
            flex: 1,
            width: "100%",
            alignSelf: "center",
            maxWidth: Platform.OS === "web" && !path.startsWith("/admin") ? 520 : undefined,
          }}
        >
          <Stack screenOptions={{ ...stackOptions, contentStyle: { backgroundColor: dark ? "#0F172A" : "#F8F9F7" } }} screenLayout={rootScreenLayout}>
            <Stack.Screen name="index" options={fade} />
            <Stack.Screen name="(auth)" options={fade} />
            <Stack.Screen name="(client)" options={fade} />
            <Stack.Screen name="(provider)" options={fade} />
            <Stack.Screen name="legacy" options={fade} />
            <Stack.Screen name="order/[id]" options={{ ...modal, presentation: "modal" }} />
            <Stack.Screen name="welcome" />
          </Stack>
        </View>
      </View>
      <ToastMessage config={toastConfig} topOffset={56} />
    </AppProviders>
  );
}
