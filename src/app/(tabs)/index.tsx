import type { ComponentType } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
  ArrowRight,
  BatteryCharging,
  Bell,
  CarFront,
  ChevronRight,
  Map,
  MapPin,
} from 'lucide-react-native';
import { MotiView } from 'moti';
import { useOrderStore } from '@/stores/useOrderStore';

type Icon = ComponentType<{ color?: string; size?: number; strokeWidth?: number }>;

const services: { label: string; hint: string; icon: Icon }[] = [
  { label: 'Reboque', hint: 'Levar a viatura', icon: CarFront },
  { label: 'Bateria', hint: 'Sem carga', icon: BatteryCharging },
];

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const active = useOrderStore((state) => state.orders.find((item) => item.status === 'on_the_way'));

  return (
    <View className="flex-1 bg-[#F7FAF8]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 38 }}
        contentContainerClassName="px-2 pt-12"
      >
        <View className="mb-6 flex-row items-center justify-between px-4">
          <Text className="text-[25px] tracking-[-0.8px] text-[#10203A]">
            Olá, <Text className="font-black">Armando</Text>
          </Text>
          <Pressable
            accessibilityLabel="Notificações"
            accessibilityRole="button"
            onPress={() => router.push('/notifications')}
            className="relative h-[52px] w-[52px] items-center justify-center rounded-full bg-white"
            style={{ shadowColor: '#172B24', shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 2 }}
          >
            <Bell size={25} color="#10203A" strokeWidth={2.2} />
            <View className="absolute right-[11px] top-[10px] h-[10px] w-[10px] rounded-full bg-[#06A64F]" />
          </Pressable>
        </View>

        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 450 }}
          className="mb-8 h-[330px] overflow-hidden rounded-[34px] bg-[#006B4F]"
          style={{ borderRadius: 34, overflow: 'hidden' }}
        >
          <Image
            source={require('../../../assets/illustrations/roadside-assistance-hero.png')}
            contentFit="cover"
            contentPosition={width <= 480 ? 'right center' : 'center'}
            transition={180}
            style={StyleSheet.absoluteFillObject}
          />
          <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0, 107, 79, 0.65)' }]}
          />
          <View className="relative flex-1 px-6 pb-6 pt-9">
            <Text className="max-w-[305px] text-[41px] font-black leading-[45px] tracking-[-1.5px] text-white">
              Precisa de ajuda{`\n`}na estrada?
            </Text>
            <Text className="mt-5 max-w-[290px] text-[21px] leading-[30px] text-white/90">
              Peça um reboque ou{`\n`}assistência no local.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/request/service')}
              className="mt-auto h-[64px] w-[250px] flex-row items-center justify-between rounded-[24px] bg-white px-6"
              style={({ pressed }) => ({ opacity: pressed ? 0.86 : 1 })}
            >
              <Text className="text-[20px] font-black text-[#006B4F]">Pedir assistência</Text>
              <ArrowRight size={29} color="#087A4D" strokeWidth={2.6} />
            </Pressable>
          </View>
        </MotiView>

        {active ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(`/order/${active.id}`)}
            className="mb-10 min-h-[260px] rounded-[32px] bg-white px-7 pb-7 pt-7"
            style={{ shadowColor: '#13251E', shadowOpacity: 0.06, shadowRadius: 18, shadowOffset: { width: 0, height: 7 }, elevation: 2 }}
          >
            <View className="flex-row items-center">
              <View className="mr-2 h-3 w-3 rounded-full bg-[#F1A100]" />
              <Text className="rounded-full bg-[#FFF3D0] px-3 py-1 text-[13px] font-black tracking-[0.2px] text-[#C57B00]">
                ASSISTÊNCIA ACTIVA
              </Text>
            </View>
            <View className="mt-5 flex-row items-center">
              <Text className="flex-1 text-[23px] font-black leading-7 tracking-[-0.7px] text-[#10203A]">
                {active.provider} está a caminho
              </Text>
              <View className="ml-3 h-[82px] w-[82px] items-center justify-center rounded-full bg-[#E0F9EA]">
                <CarFront size={42} color="#079649" strokeWidth={2.1} />
              </View>
            </View>
            <View className="mt-5 flex-row items-center">
              <MapPin size={25} color="#08A65A" strokeWidth={2.5} />
              <Text className="ml-3 flex-1 text-[18px] text-[#64748B]">
                {active.etaMinutes} min · {active.address}
              </Text>
            </View>
            <View className="my-5 h-px bg-[#E6ECE9]" />
            <View className="h-[66px] flex-row items-center rounded-[23px] bg-[#E8F2FF] px-5">
              <Map size={29} color="#1559B5" strokeWidth={2.3} />
              <Text className="ml-5 flex-1 text-[19px] font-black text-[#1559B5]">Acompanhar no mapa</Text>
              <ArrowRight size={28} color="#1559B5" strokeWidth={2.4} />
            </View>
          </Pressable>
        ) : null}

        <Text className="mb-6 px-3 text-[31px] font-black tracking-[-1px] text-[#0B201A]">Como podemos ajudar?</Text>
        <View className="flex-row gap-4 px-2">
          {services.map(({ label, hint, icon: Icon }) => (
            <Pressable
              key={label}
              accessibilityRole="button"
              onPress={() => router.push('/request/service')}
              className="min-h-[210px] flex-1 rounded-[30px] bg-white px-5 pb-6 pt-6"
              style={{ shadowColor: '#13251E', shadowOpacity: 0.045, shadowRadius: 14, shadowOffset: { width: 0, height: 5 }, elevation: 1 }}
            >
              <View className="h-[76px] w-[76px] items-center justify-center rounded-full bg-[#DDF8E8]">
                <Icon size={38} color="#079649" strokeWidth={2.2} />
              </View>
              <View className="mt-auto flex-row items-end justify-between">
                <View>
                  <Text className="text-[23px] font-black tracking-[-0.4px] text-[#10203A]">{label}</Text>
                  <Text className="mt-1 text-[17px] text-[#64748B]">{hint}</Text>
                </View>
                <ChevronRight size={28} color="#08A65A" strokeWidth={2.5} />
              </View>
            </Pressable>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}
