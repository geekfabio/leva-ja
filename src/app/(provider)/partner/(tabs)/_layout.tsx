import { Tabs } from "expo-router";
import { ChartColumn, ClipboardList, History, House, UserRound } from "lucide-react-native";
import { TabBar } from "@/components/core/TabBar";
import { useTabOptions } from "@/components/core/ScreenTransitions";

export default function ProviderTabsLayout() {
  const options = useTabOptions();
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={options}>
      <Tabs.Screen name="index" options={{ title: "Início", tabBarIcon: ({ color }) => <House size={24} color={color} /> }} />
      <Tabs.Screen name="requests" options={{ title: "Pedidos", tabBarIcon: ({ color }) => <ClipboardList size={24} color={color} /> }} />
      <Tabs.Screen name="earnings" options={{ title: "Ganhos", tabBarIcon: ({ color }) => <ChartColumn size={24} color={color} /> }} />
      <Tabs.Screen name="history" options={{ title: "Histórico", tabBarIcon: ({ color }) => <History size={24} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Perfil", tabBarIcon: ({ color }) => <UserRound size={24} color={color} /> }} />
    </Tabs>
  );
}
