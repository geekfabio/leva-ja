import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Bell, ArrowUpRight, ChevronRight, MapPin } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { VehicleArt } from "@/components/transport/VehicleArt";
import { AppButton } from "@/components/ui/AppButton";
import { useOrderStore } from "@/stores/useOrderStore";
import { useRequestDraft } from "@/stores/useRequestDraft";
import { ServiceId, services } from "@/domain/catalog";
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const active = useOrderStore((state) =>
    state.orders.find((item) =>
      [
        "matching",
        "accepted",
        "on_the_way",
        "arrived",
        "service_started",
      ].includes(item.status),
    ),
  );
  const select = useOrderStore((state) => state.selectOrder);
  const reset = useRequestDraft((state) => state.reset);
  const start = (id: ServiceId) => {
    reset(id);
    router.push({ pathname: "/request/service", params: { service: id } });
  };
  const featured = services.filter((service) =>
    ["light_cargo", "moving", "heavy_cargo", "tow"].includes(service.id),
  );
  return (
    <ScrollView
      className="flex-1 bg-surface dark:bg-slate-950"
      contentContainerStyle={{
        paddingTop: Math.max(insets.top, 24),
        paddingHorizontal: 20,
        paddingBottom: 32,
      }}
    >
      <View className="mb-5 flex-row items-center justify-between">
        <View>
          <Text className="text-sm text-muted">Olá, Armando</Text>
          <Text className="mt-1 text-2xl font-bold tracking-tight text-ink dark:text-white">
            O teu dia em movimento.
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Notificações"
          onPress={() => router.push("/notifications" as never)}
          className="h-12 w-12 items-center justify-center rounded-full border border-line bg-white"
        >
          <Bell size={21} color="#132A21" />
        </Pressable>
      </View>
      <View className="mb-6 flex-row items-center gap-2">
        <MapPin size={16} color="#087F4F" />
        <Text className="text-sm text-muted">Luanda, Angola</Text>
      </View>
      <View className="mb-7 overflow-hidden rounded-3xl bg-brand-bright p-6">
        <View className="flex-row justify-between">
          <Text className="text-xs font-bold tracking-widest text-ink">
            LEVA JÁ · TRANSPORTE & APOIO
          </Text>
          <ArrowUpRight size={23} color="#132A21" />
        </View>
        <Text className="mt-5 text-3xl font-bold tracking-tight text-ink">
          Da tua carga{"\n"}à tua próxima casa.
        </Text>
        <View className="flex-row items-center">
          <Text className="flex-1 text-base leading-6 text-ink">
            Pequenas entregas, grandes mudanças e ajuda na estrada.
          </Text>
          <VehicleArt vehicle="pickup" size={150} />
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => start("light_cargo")}
          className="min-h-14 flex-row items-center justify-between rounded-2xl bg-ink px-5 py-4"
        >
          <Text className="text-base font-bold text-white">
            Vamos transportar
          </Text>
          <ChevronRight size={20} color="#34D186" />
        </Pressable>
      </View>
      {active ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            select(active.id);
            router.push(`/order/${active.id}`);
          }}
          className="mb-7 rounded-3xl border border-brand bg-white p-5 dark:bg-slate-900"
        >
          <Text className="text-xs font-bold text-brand">PEDIDO EM CURSO</Text>
          <Text className="mt-2 text-lg font-bold text-ink dark:text-white">
            {active.category}
          </Text>
          <Text className="mt-2 text-sm text-muted">{active.address}</Text>
          <View className="mt-4 flex-row justify-between">
            <Text className="font-semibold text-brand">Acompanhar pedido</Text>
            <ChevronRight size={18} color="#087F4F" />
          </View>
        </Pressable>
      ) : null}
      <Text className="mb-4 text-xl font-bold text-ink dark:text-white">
        O que precisas de levar?
      </Text>
      <View className="mb-6 flex-row flex-wrap justify-between gap-y-3">
        {featured.map((service) => (
          <Pressable
            key={service.id}
            accessibilityRole="button"
            onPress={() => start(service.id)}
            style={{ width: "48%" }}
            className="overflow-hidden rounded-3xl border border-line bg-white pb-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <View className="items-center bg-brand-soft/40">
              <VehicleArt vehicle={service.vehicle} size={140} />
            </View>
            <Text className="mt-2 px-4 text-base font-bold text-ink dark:text-white">
              {service.name}
            </Text>
            <Text className="mt-1 px-4 text-xs leading-5 text-muted">
              {service.description}
            </Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => start("battery")}
        className="mb-6 flex-row items-center rounded-3xl bg-ink p-3"
      >
        <VehicleArt vehicle="support" size={105} />
        <View className="flex-1">
          <Text className="text-lg font-bold text-white">
            Precisas de apoio?
          </Text>
          <Text className="mt-1 text-sm leading-5 text-slate-300">
            Bateria, pneu e combustível no local.
          </Text>
        </View>
        <ChevronRight size={20} color="#34D186" />
      </Pressable>
      <AppButton
        label="Centro de ajuda"
        variant="ghost"
        onPress={() => router.push("/support")}
      />
    </ScrollView>
  );
}
