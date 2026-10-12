import { Tabs } from 'expo-router';
import { ClipboardList, House, UserRound } from 'lucide-react-native';

const icon = (Icon: typeof House) => ({ color, size }: { color: string; size: number }) => <Icon color={color} size={size} strokeWidth={2.2} />;

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#08A65A',
      tabBarInactiveTintColor: '#8A9AB0',
      tabBarLabelStyle: { fontSize: 14, fontWeight: '700', marginBottom: 7 },
      tabBarIconStyle: { marginTop: 5 },
      tabBarStyle: { backgroundColor: '#FFFFFF', borderTopColor: '#EEF2F0', height: 78, paddingTop: 4 },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: icon(House) }} />
      <Tabs.Screen name="orders" options={{ title: 'Pedidos', tabBarIcon: icon(ClipboardList) }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarIcon: icon(UserRound) }} />
    </Tabs>
  );
}
