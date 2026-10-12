import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowRight, Check, LockKeyhole, Truck, UserRound } from 'lucide-react-native';
import { MotiView } from 'moti';
import { BrandMark } from '@/components/ui/BrandMark';

type Role = 'customer' | 'provider' | 'admin';
type MockUser = { id: string; name: string; detail: string; initials: string; icon: typeof UserRound };

const users: MockUser[] = [
  { id: 'armando', name: 'Armando Trindade', detail: 'Cliente · +244 912 345 678', initials: 'AT', icon: UserRound },
  { id: 'joao', name: 'João Manuel', detail: 'Prestador · +244 923 456 789', initials: 'JM', icon: Truck },
];

const roles: { id: Role; label: string; helper: string; icon: typeof UserRound }[] = [
  { id: 'customer', label: 'Cliente', helper: 'Pedir assistência', icon: UserRound },
  { id: 'provider', label: 'Prestador', helper: 'Aceitar serviços', icon: Truck },
  { id: 'admin', label: 'Admin', helper: 'Gerir operações', icon: LockKeyhole },
];

export default function LoginScreen() {
  const [selectedUser, setSelectedUser] = useState('armando');
  const [selectedRole, setSelectedRole] = useState<Role>('customer');
  const activeRole = roles.find((role) => role.id === selectedRole) ?? roles[0];
  const ActiveIcon = activeRole.icon;

  function enterApp() {
    if (selectedRole === 'customer') router.replace('/(tabs)' as never);
    if (selectedRole === 'provider') router.replace('/provider' as never);
    if (selectedRole === 'admin') router.replace('/admin' as never);
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F7FAF8]" edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="px-6 pb-8 pt-5">
        <View className="flex-row items-center justify-between">
          <BrandMark />
          <View className="flex-row items-center rounded-full bg-[#E2F8EA] px-3 py-2">
            <View className="mr-2 h-2 w-2 rounded-full bg-[#08A65A]" />
            <Text className="text-[11px] font-black tracking-[0.6px] text-[#087A4D]">DEMO</Text>
          </View>
        </View>

        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 420 }}
          className="mt-8 rounded-[30px] bg-[#006B4F] px-6 pb-6 pt-7"
        >
          <View className="mb-5 h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <ActiveIcon size={25} color="#FFFFFF" strokeWidth={2.2} />
          </View>
          <Text className="text-[31px] font-black leading-9 tracking-[-0.8px] text-white">Bem-vindo ao Leva Já</Text>
          <Text className="mt-3 text-[16px] leading-6 text-white/85">
            Escolhe uma conta mockada e entra no fluxo que queres apresentar.
          </Text>
        </MotiView>

        <Text className="mb-3 mt-8 text-[20px] font-black tracking-[-0.3px] text-[#10203A]">Escolhe o utilizador</Text>
        <View className="gap-3">
          {users.map((user) => {
            const selected = selectedUser === user.id;
            const Icon = user.icon;
            return (
              <Pressable
                key={user.id}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setSelectedUser(user.id)}
                className={`flex-row items-center rounded-[22px] border px-4 py-4 ${selected ? 'border-[#08A65A] bg-[#E8F8EE]' : 'border-transparent bg-white'}`}
              >
                <View className={`h-12 w-12 items-center justify-center rounded-2xl ${selected ? 'bg-[#08A65A]' : 'bg-[#E1F7E9]'}`}>
                  <Icon size={23} color={selected ? '#FFFFFF' : '#079649'} strokeWidth={2.2} />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="font-black text-[#10203A]">{user.name}</Text>
                  <Text className="mt-1 text-sm text-[#64748B]">{user.detail}</Text>
                </View>
                <View className={`h-6 w-6 items-center justify-center rounded-full border-2 ${selected ? 'border-[#08A65A] bg-[#08A65A]' : 'border-[#CBD5E1]'}`}>
                  {selected ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>

        <Text className="mb-3 mt-7 text-[20px] font-black tracking-[-0.3px] text-[#10203A]">Entrar como</Text>
        <View className="flex-row gap-2">
          {roles.map((role) => {
            const selected = selectedRole === role.id;
            const Icon = role.icon;
            return (
              <Pressable
                key={role.id}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setSelectedRole(role.id)}
                className={`min-h-[94px] flex-1 rounded-[22px] border px-3 py-4 ${selected ? 'border-[#08A65A] bg-[#E8F8EE]' : 'border-transparent bg-white'}`}
              >
                <Icon size={22} color={selected ? '#079649' : '#718096'} strokeWidth={2.2} />
                <Text className={`mt-3 text-[13px] font-black ${selected ? 'text-[#087A4D]' : 'text-[#10203A]'}`}>{role.label}</Text>
                <Text className="mt-1 text-[10px] text-[#64748B]">{role.helper}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={enterApp}
          className="mt-7 h-16 flex-row items-center justify-between rounded-[22px] bg-[#08A65A] px-6"
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        >
          <View>
            <Text className="text-[11px] font-bold uppercase tracking-[0.6px] text-white/75">Sessão mockada</Text>
            <Text className="mt-1 text-[17px] font-black text-white">{activeRole.id === 'admin' ? 'Abrir painel admin' : `Entrar como ${activeRole.label.toLowerCase()}`}</Text>
          </View>
          <ArrowRight size={27} color="#FFFFFF" strokeWidth={2.5} />
        </Pressable>

        <Text className="mt-5 text-center text-xs leading-5 text-[#64748B]">Nenhuma credencial real é necessária nesta apresentação.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
