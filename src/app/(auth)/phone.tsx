import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { MessageCircleMore } from 'lucide-react-native';
import { AuthScaffold } from '@/components/ui/AuthScaffold';
import { AppButton } from '@/components/ui/AppButton';

export default function PhoneScreen() {
  const [phone, setPhone] = useState('');
  const isValid = phone.replace(/\D/g, '').length >= 9;

  return (
    <AuthScaffold title="Qual é o teu número?" description="Vamos enviar um código de confirmação por SMS. Nunca partilharemos o teu contacto.">
      <View className="rounded-3xl bg-white p-5 dark:bg-slate-900">
        <View className="mb-5 h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft"><MessageCircleMore size={22} color="#16A34A" /></View>
        <Text className="mb-2 text-sm font-bold text-ink dark:text-white">Número de telemóvel</Text>
        <View className="flex-row items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 dark:border-slate-700 dark:bg-slate-800">
          <Text className="border-r border-slate-200 py-4 pr-3 font-bold text-ink dark:border-slate-700 dark:text-white">+244</Text>
          <TextInput value={phone} onChangeText={setPhone} placeholder="9xx xxx xxx" keyboardType="phone-pad" className="flex-1 px-3 py-4 text-base font-semibold text-ink dark:text-white" placeholderTextColor="#94A3B8" />
        </View>
        <Text className="mt-3 text-xs leading-5 text-muted">Serão aplicadas as tarifas normais da tua operadora.</Text>
      </View>
      <View className="mt-6"><AppButton label="Receber código" disabled={!isValid} onPress={() => router.push({ pathname: '/(auth)/otp', params: { phone } })} /></View>
    </AuthScaffold>
  );
}
