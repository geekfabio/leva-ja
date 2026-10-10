import { Text, View } from 'react-native';
import { CheckCircle2, Info, XCircle } from 'lucide-react-native';
import type { ToastConfig, ToastConfigParams } from 'react-native-toast-message';

const palette = {
  success: { accent: '#16A34A', Icon: CheckCircle2 },
  error: { accent: '#DC2626', Icon: XCircle },
  info: { accent: '#2563EB', Icon: Info },
} as const;

function ToastCard({ type, text1, text2 }: ToastConfigParams<unknown> & { type: keyof typeof palette }) {
  const { accent, Icon } = palette[type];
  return (
    <View
      className="mx-4 w-[92%] max-w-md flex-row items-start gap-3 rounded-2xl bg-ink px-4 py-3.5"
      style={{ borderLeftWidth: 4, borderLeftColor: accent, shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6 }}
    >
      <View className="mt-0.5">
        <Icon size={20} color={accent} />
      </View>
      <View className="flex-1">
        {text1 ? <Text className="font-black text-white">{text1}</Text> : null}
        {text2 ? <Text className="mt-0.5 text-xs leading-5 text-slate-300">{text2}</Text> : null}
      </View>
    </View>
  );
}

export const toastConfig: ToastConfig = {
  success: (params) => <ToastCard {...params} type="success" />,
  error: (params) => <ToastCard {...params} type="error" />,
  info: (params) => <ToastCard {...params} type="info" />,
};
