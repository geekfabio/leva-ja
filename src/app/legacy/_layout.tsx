import { Tabs } from "expo-router";
import { CarFront, ClipboardList, UserRound } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, useColorScheme } from "react-native";
const icon = (Icon: typeof CarFront) =>
  function TabIcon({ color, focused }: { color: string; focused: boolean }) {
    return (
      <View
        style={{
          borderRadius: 24,
          paddingHorizontal: 18,
          paddingVertical: 3,
          backgroundColor: focused ? "#E5F8EE" : "transparent",
        }}
      >
        <Icon color={color} size={22} strokeWidth={2} />
      </View>
    );
  };
export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const dark = useColorScheme() === "dark";
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#087F4F",
        tabBarInactiveTintColor: "#64746C",
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600", marginTop: 3 },
        tabBarStyle: {
          backgroundColor: dark ? "#0F172A" : "#FFFFFF",
          borderTopColor: dark ? "#334155" : "#DFE7E2",
          height: 66 + Math.max(insets.bottom, 8),
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 8),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Início", tabBarIcon: icon(CarFront) }}
      />
      <Tabs.Screen
        name="orders"
        options={{ title: "Pedidos", tabBarIcon: icon(ClipboardList) }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Perfil", tabBarIcon: icon(UserRound) }}
      />
    </Tabs>
  );
}
