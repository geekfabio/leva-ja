import 'react-native-gesture-handler';
import '../../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import ToastMessage from 'react-native-toast-message';
import { AppProviders } from '@/providers/AppProviders';
import { toastConfig } from '@/components/ui/AppToast';

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="order/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="welcome" />
      </Stack>
      <ToastMessage config={toastConfig} topOffset={56} />
    </AppProviders>
  );
}
