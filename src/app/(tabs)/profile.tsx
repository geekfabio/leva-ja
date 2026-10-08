import { Text, View } from 'react-native';
import { Bell, ChevronRight, CreditCard, MapPinned, Settings } from 'lucide-react-native';

const entries = [{ label: 'Os meus endereços', icon: MapPinned }, { label: 'Métodos de pagamento', icon: CreditCard }, { label: 'Notificações', icon: Bell }, { label: 'Definições', icon: Settings }];

export default function ProfileScreen() {
  return <View className="flex-1 bg-surface px-5 pt-16 dark:bg-slate-950"><View className="mb-8 flex-row items-center gap-4"><View className="h-16 w-16 items-center justify-center rounded-full bg-brand"><Text className="text-xl font-bold text-white">AT</Text></View><View><Text className="text-2xl font-bold text-ink dark:text-white">Armando Trindade</Text><Text className="mt-1 text-muted">Cliente Leva Já</Text></View></View>{entries.map(({ label, icon: Icon }) => <View key={label} className="mb-3 flex-row items-center rounded-2xl bg-white p-4 dark:bg-slate-800"><Icon size={21} color="#FF5B26" /><Text className="ml-3 flex-1 font-semibold text-ink dark:text-white">{label}</Text><ChevronRight size={19} color="#94A3B8" /></View>)}</View>;
}
