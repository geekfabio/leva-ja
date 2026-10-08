import type { ReactNode } from 'react';
import { SafeAreaView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { BrandMark } from '@/components/ui/BrandMark';

type AuthScaffoldProps = {
  title: string;
  description: string;
  children: ReactNode;
  showBack?: boolean;
  footer?: ReactNode;
};

export function AuthScaffold({ title, description, children, showBack = true, footer }: AuthScaffoldProps) {
  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-slate-950">
      <View className="flex-1 px-6 pb-6 pt-3">
        <View className="mb-10 flex-row items-center justify-between">
          {showBack ? <View className="h-10 w-10 items-center justify-center rounded-2xl bg-white dark:bg-slate-900" onTouchEnd={() => router.back()}><ChevronLeft size={22} color="#17212B" /></View> : <View className="w-10" />}
          <BrandMark compact />
          <View className="w-10" />
        </View>

        <View className="flex-1">
          <Text className="text-3xl font-black leading-tight tracking-tight text-ink dark:text-white">{title}</Text>
          <Text className="mt-3 text-base leading-6 text-muted">{description}</Text>
          <View className="mt-8 flex-1">{children}</View>
        </View>

        {footer ? <View className="pt-5">{footer}</View> : null}
      </View>
    </SafeAreaView>
  );
}
