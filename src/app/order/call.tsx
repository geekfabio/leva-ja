import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { PhoneCall } from 'lucide-react-native';
import { AppButton } from '@/components/ui/AppButton';
export default function CallScreen() { return <View className="flex-1 justify-between bg-ink px-6 pb-12 pt-24"><View><View className="h-20 w-20 items-center justify-center rounded-[28px] bg-brand"><PhoneCall size={38} color="#fff" /></View><Text className="mt-9 text-3xl font-black text-white">Ligar a João Manuel?</Text><Text className="mt-3 text-base leading-6 text-slate-300">+244 9•• ••• •42{`\n`}O número permanece protegido nesta fase.</Text></View><View className="gap-3"><AppButton label="Confirmar chamada (mock)" onPress={() => router.back()} /><AppButton label="Agora não" variant="ghost" onPress={() => router.back()} /></View></View>; }
