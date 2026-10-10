import { ScrollView, useWindowDimensions, View } from 'react-native';
import type { ReactNode } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminNav } from '@/components/admin/AdminNav';

type Props = { active: string; navActive?: string; children: ReactNode };

export function AdminShell({ active, navActive, children }: Props) {
  const { width } = useWindowDimensions();
  const desktop = width >= 1024;
  return (
    <View className="flex-1 flex-row bg-[#F7F8F6] dark:bg-slate-950">
      <AdminSidebar active={active} />
      <ScrollView className="flex-1" contentContainerClassName={`${desktop ? 'px-9' : 'px-5'} pb-10 pt-10`}>
        {!desktop && <AdminNav active={navActive ?? active} />}
        {children}
      </ScrollView>
    </View>
  );
}
