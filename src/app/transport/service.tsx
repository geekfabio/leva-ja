import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppButton } from '@/components/ui/AppButton';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ServiceIcon } from '@/components/ui/ServiceIcon';
import { transportServices } from '@/mocks/services';

export default function TransportServiceScreen() {
  const [selected, setSelected] = useState('cargo_medium');
  return (
    <View className="flex-1 bg-surface px-5 dark:bg-slate-950">
      <ScreenHeader title="O que vais transportar?" subtitle="Passo 1 de 4" />
      <ScrollView contentContainerClassName="pb-28">
        <Text className="mb-6 text-base leading-6 text-muted">Escolhe o tipo de carga para sugerirmos a viatura certa.</Text>
        <View className="gap-3">
          {transportServices.map(({ id, title, description, emoji, tone }) => {
            const active = id === selected;
            return (
              <Pressable
                key={id}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                onPress={() => setSelected(id)}
                className={`flex-row items-center gap-4 rounded-3xl border p-4 ${active ? 'border-brand bg-brand-soft' : 'border-transparent bg-white dark:bg-slate-900'}`}
              >
                <ServiceIcon emoji={emoji} tone={tone} size={48} />
                <View className="flex-1">
                  <Text className="font-black text-ink dark:text-white">{title}</Text>
                  <Text className="mt-1 text-xs leading-5 text-muted">{description}</Text>
                </View>
                <View className={`h-5 w-5 rounded-full border-2 ${active ? 'border-brand bg-brand' : 'border-slate-300'}`} />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <View className="absolute bottom-0 left-0 right-0 border-t border-slate-100 bg-surface px-5 pb-7 pt-4 dark:border-slate-800 dark:bg-slate-950">
        <AppButton label="Continuar" onPress={() => router.push('/transport/cargo' as never)} />
      </View>
    </View>
  );
}
