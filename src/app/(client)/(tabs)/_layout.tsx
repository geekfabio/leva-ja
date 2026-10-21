import { Tabs } from "expo-router";
import { ClipboardList, House, Truck, UserRound } from "lucide-react-native";
import { TabBar } from "@/components/core/TabBar";
import { useTabOptions } from "@/components/core/ScreenTransitions";

export default function ClientTabsLayout() {
  const options = useTabOptions();
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={options}>
      <Tabs.Screen name="home" options={{ title: "Início", tabBarIcon: ({ color }) => <House size={24} color={color} /> }} />
      <Tabs.Screen name="services" options={{ title: "Serviços", tabBarIcon: ({ color }) => <ClipboardList size={24} color={color} /> }} />
      <Tabs.Screen name="trips" options={{ title: "As minhas viagens", tabBarIcon: ({ color }) => <Truck size={24} color={color} /> }} />
      <Tabs.Screen name="account" options={{ title: "Perfil", tabBarIcon: ({ color }) => <UserRound size={24} color={color} /> }} />
    </Tabs>
  );
}
