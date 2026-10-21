import { Stack } from 'expo-router';
import { useStackOptions, webScreenLayout } from '@/components/core/ScreenTransitions';

const screenLayout = webScreenLayout('push');

export default function AuthLayout() {
  const options = useStackOptions('push');
  return <Stack screenOptions={options} screenLayout={screenLayout} />;
}
