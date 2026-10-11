import "react-native-gesture-handler";
import "../../global.css";
import { Stack, usePathname } from "expo-router";
import { Platform, View, useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AppProviders } from "@/providers/AppProviders";

export default function RootLayout() {
  const path = usePathname();
  const dark = useColorScheme() === "dark";
  return (
    <AppProviders>
      <StatusBar style={dark ? "light" : "dark"} />
      <View style={{ flex: 1, backgroundColor: dark ? "#0F172A" : "#EDF2EF" }}>
        <View
          style={{
            flex: 1,
            width: "100%",
            alignSelf: "center",
            maxWidth:
              Platform.OS === "web" && !path.startsWith("/admin")
                ? 680
                : undefined,
          }}
        >
          <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="order/[id]"
              options={{ presentation: "modal" }}
            />
            <Stack.Screen name="welcome" />
          </Stack>
        </View>
      </View>
    </AppProviders>
  );
}
