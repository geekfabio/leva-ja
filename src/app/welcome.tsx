import { ImageBackground, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { AppButton } from '@/components/ui/AppButton';

export default function WelcomeScreen() {
  return (
    <ImageBackground
      className="flex-1 justify-end bg-ink"
      source={{ uri: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=1200&q=85' }}
    >
      <View className="bg-black/55 px-6 pb-12 pt-24">
        <View className="mb-5 self-start rounded-full bg-brand px-4 py-2"><Text className="font-bold text-white">LEVA JÁ</Text></View>
        <Text className="text-4xl font-bold leading-tight text-white">Tudo o que precisas, onde estiveres.</Text>
        <Text className="mb-8 mt-3 text-base leading-6 text-slate-200">Compras, refeições e entregas rápidas em Luanda.</Text>
        <AppButton label="Começar agora" icon={<ArrowRight size={18} color="white" />} onPress={() => router.replace('/')} />
      </View>
    </ImageBackground>
  );
}
