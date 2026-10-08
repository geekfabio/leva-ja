import { Tabs } from 'expo-router';
import { Home, PackageSearch, UserRound } from 'lucide-react-native';

const icon = (Icon: typeof Home) => ({ color, size }: { color: string; size: number }) => <Icon color={color} size={size} strokeWidth={2.2} />;

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#FF5B26', tabBarInactiveTintColor: '#94A3B8', tabBarStyle: { borderTopColor: '#E5E7EB', height: 64, paddingTop: 6 } }}>
      <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: icon(Home) }} />
      <Tabs.Screen name="orders" options={{ title: 'Pedidos', tabBarIcon: icon(PackageSearch) }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarIcon: icon(UserRound) }} />
    </Tabs>
  );
}
