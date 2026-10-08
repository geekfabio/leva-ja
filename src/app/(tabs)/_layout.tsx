import { Tabs } from 'expo-router';
import { CarFront, ClipboardList, UserRound } from 'lucide-react-native';

const icon = (Icon: typeof CarFront) => ({ color, size }: { color: string; size: number }) => <Icon color={color} size={size} strokeWidth={2.2} />;

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#16A34A', tabBarInactiveTintColor: '#94A3B8', tabBarStyle: { borderTopColor: '#E5E7EB', height: 64, paddingTop: 6 } }}>
      <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: icon(CarFront) }} />
      <Tabs.Screen name="orders" options={{ title: 'Assistências', tabBarIcon: icon(ClipboardList) }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarIcon: icon(UserRound) }} />
    </Tabs>
  );
}
