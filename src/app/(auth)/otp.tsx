import { useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { CircleCheck } from 'lucide-react-native';
import { AuthScaffold } from '@/components/ui/AuthScaffold';
import { AppButton } from '@/components/ui/AppButton';

export default function OtpScreen() {
  const { phone } = useLocalSearchParams<{ phone?: string }>();
  const [code, setCode] = useState('');
  const ready = code.length === 6;

  useEffect(() => { if (ready) return; }, [ready]);

  return (
    <AuthScaffold title="Confirma o teu número" description={`Enviámos um código de 6 dígitos para +244 ${phone || '9xx xxx xxx'}.`}>
      <View className="rounded-3xl bg-white p-5 dark:bg-slate-900">
        <View className="mb-5 h-12 w-12 items-center justify-center rounded-2xl bg-green-100"><CircleCheck size={23} color="#16A34A" /></View>
        <Text className="mb-3 text-sm font-bold text-ink dark:text-white">Código de confirmação</Text>
        <TextInput value={code} onChangeText={(value) => setCode(value.replace(/\D/g, ''))} maxLength={6} autoFocus keyboardType="number-pad" textContentType="oneTimeCode" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-center text-2xl font-black tracking-[10px] text-ink dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="000000" placeholderTextColor="#CBD5E1" />
        <Text className="mt-4 text-center text-sm text-muted">Não recebeste? <Text className="font-bold text-brand">Reenviar em 00:45</Text></Text>
      </View>
      <View className="mt-6"><AppButton label="Confirmar código" disabled={!ready} onPress={() => router.replace('/(auth)/location')} /></View>
    </AuthScaffold>
  );
}
