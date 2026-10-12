import { Stack, usePathname } from 'expo-router';
import { View } from 'react-native';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

function activeSection(pathname: string) {
  if (pathname.includes('/section/customers') || pathname.includes('/detail/customer')) return 'Clientes';
  if (pathname.includes('/section/providers') || pathname.includes('/detail/provider')) return 'Prestadores';
  if (pathname.includes('/section/payments') || pathname.includes('/detail/payment')) return 'Financeiro';
  if (pathname.includes('/section/safety') || pathname.includes('/detail/safety')) return 'Segurança';
  if (pathname.includes('/section/settings')) return 'Configurações';
  if (pathname.includes('/pricing')) return 'Mapa operacional';
  if (pathname.includes('/reports')) return 'Relatórios';
  if (pathname.includes('/campaigns')) return 'Campanhas';
  if (pathname.includes('/section/orders') || pathname.includes('/detail/order')) return 'Serviços';
  return 'Visão geral';
}

export default function AdminLayout() {
  const pathname = usePathname();
  const keepOwnSidebar = pathname === '/admin' || pathname === '/admin/' || pathname.endsWith('/pricing');
  const login = pathname.endsWith('/login');

  if (keepOwnSidebar || login) {
    return <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />;
  }

  return (
    <View className="flex-1 flex-row bg-[#F7F8F6] dark:bg-slate-950">
      <AdminSidebar active={activeSection(pathname)} />
      <View className="flex-1">
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
      </View>
    </View>
  );
}
