import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import { router } from "expo-router";
import { money } from "@/domain/catalog";
import { VehicleArt } from "@/components/transport/VehicleArt";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Banknote,
  ChevronRight,
  ClipboardList,
  Headphones,
  Star,
  Truck,
} from "lucide-react-native";
import { ProviderMetric } from "@/components/provider/ProviderMetric";
import { ProviderStatusPill } from "@/components/provider/ProviderStatusPill";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { useOrderStore } from "@/stores/useOrderStore";

export default function ProviderHome() {
  const { online, setOnline, orders } = useOrderStore();
  const order = orders.find((item) =>
    ["accepted", "on_the_way", "arrived", "service_started"].includes(
      item.status,
    ),
  );
  const completed = orders.filter((item) => item.status === "completed");
  const total = completed.reduce((sum, item) => sum + item.amount, 0);
  const insets = useSafeAreaInsets();
  const active = [
    "accepted",
    "on_the_way",
    "arrived",
    "service_started",
  ].includes(order?.status || "");
  return (
    <ScrollView
      className="flex-1 bg-surface dark:bg-slate-950"
      contentContainerStyle={{
        paddingTop: Math.max(insets.top, 24),
        paddingHorizontal: 20,
        paddingBottom: 28,
      }}
    >
      <View className="mb-6 flex-row items-center justify-between">
        <View>
          <Text className="text-sm text-muted">ÁREA DO PARCEIRO</Text>
          <Text className="mt-1 text-2xl font-bold text-ink dark:text-white">
            Bom dia, João.
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Suporte ao parceiro"
          onPress={() => router.push("/provider/support" as never)}
          className="h-12 w-12 items-center justify-center rounded-full border border-line bg-white"
        >
          <Headphones size={22} color="#132A21" />
        </Pressable>
      </View>
      <AppCard>
        <View className="flex-row items-center gap-3">
          <View
            className={`h-3 w-3 rounded-full ${online ? "bg-brand" : "bg-slate-400"}`}
          />
          <View className="flex-1">
            <Text className="text-lg font-bold text-ink dark:text-white">
              {online ? "Estás online" : "Estás offline"}
            </Text>
            <Text
              accessibilityLiveRegion="polite"
              className="mt-1 text-sm leading-5 text-muted"
            >
              {online
                ? "Pronto para receber novos pedidos."
                : "Liga a disponibilidade para ver novos pedidos."}
            </Text>
          </View>
          <Switch
            accessibilityLabel="Disponibilidade para novos pedidos"
            value={online}
            onValueChange={setOnline}
            trackColor={{ false: "#CBD5E1", true: "#34D186" }}
            thumbColor="#FFFFFF"
          />
        </View>
      </AppCard>
      <View className="mt-5 rounded-3xl bg-ink p-6">
        <View className="flex-row items-center gap-2">
          <Banknote size={20} color="#34D186" />
          <Text className="text-sm text-slate-300">
            Serviços concluídos · demonstração
          </Text>
        </View>
        <Text className="mt-4 text-4xl font-bold tracking-tight text-white">
          {money(total)}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push("/provider/earnings" as never)}
          className="mt-4 min-h-12 flex-row items-center justify-between"
        >
          <Text className="font-semibold text-green-200">Consultar ganhos</Text>
          <ChevronRight size={20} color="#34D186" />
        </Pressable>
      </View>
      <View className="mt-4 flex-row flex-wrap gap-3">
        <ProviderMetric
          label="Avaliação média"
          value="4,9 / 5"
          icon={<Star size={20} color="#087F4F" />}
        />
        <ProviderMetric
          label="Serviços concluídos"
          value={String(completed.length)}
          icon={<ClipboardList size={20} color="#087F4F" />}
        />
      </View>
      <Text
        accessibilityRole="header"
        className="mb-4 mt-7 text-xl font-bold text-ink dark:text-white"
      >
        {active ? "Serviço em curso" : "O teu próximo serviço"}
      </Text>
      {active && order ? (
        <AppCard>
          <View className="flex-row items-center justify-between">
            <ProviderStatusPill status={order.status} />
            <VehicleArt vehicle={order.vehicleType || "tow"} size={80} />
          </View>
          <Text className="mt-4 text-xl font-bold text-ink dark:text-white">
            {order.category}
          </Text>
          <Text className="mt-2 text-sm leading-5 text-muted">
            {order.address}
          </Text>
          <Text className="mt-3 text-xl font-bold text-ink dark:text-white">
            {order.amount.toLocaleString("pt-PT")} Kz
          </Text>
          <View className="mt-5">
            <AppButton
              label="Continuar serviço"
              onPress={() =>
                router.push(`/provider/request/${order.id}` as never)
              }
            />
          </View>
        </AppCard>
      ) : (
        <AppCard>
          <VehicleArt vehicle="box" size={110} />
          <Text className="mt-3 text-lg font-bold text-ink dark:text-white">
            {online
              ? "Vamos encontrar o próximo pedido?"
              : "Faz uma pausa. Voltamos quando quiseres."}
          </Text>
          <Text className="mt-2 text-sm leading-5 text-muted">
            Os detalhes e o valor ficam disponíveis antes de aceitares.
          </Text>
        </AppCard>
      )}
      <View className="mt-5">
        <AppButton
          label={online ? "Ver pedidos próximos" : "Ficar online"}
          variant="ghost"
          onPress={() =>
            online
              ? router.push("/provider/requests" as never)
              : setOnline(true)
          }
        />
      </View>
      <Text className="mt-5 text-center text-xs text-muted">
        Dados e disponibilidade de demonstração.
      </Text>
    </ScrollView>
  );
}
