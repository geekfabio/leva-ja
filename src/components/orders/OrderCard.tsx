import { VehicleArt } from "@/components/transport/VehicleArt";
import { Pressable, Text, View } from "react-native";
import { CarFront, ChevronRight, Clock3, MapPin } from "lucide-react-native";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Order } from "@/types/order";

const labels: Record<Order["status"], string> = {
  draft: "Rascunho",
  matching: "A procurar",
  accepted: "Aceite",
  on_the_way: "A caminho",
  arrived: "No local",
  service_started: "Em serviço",
  completed: "Concluído",
  cancelled: "Cancelado",
  disputed: "Em disputa",
};
export function OrderCard({
  order,
  onPress,
}: {
  order: Order;
  onPress?: () => void;
}) {
  const active = [
    "matching",
    "accepted",
    "on_the_way",
    "arrived",
    "service_started",
  ].includes(order.status);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${order.category}, ${labels[order.status]}, ${order.amount.toLocaleString("pt-PT")} Kz`}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}
      className="mb-3 rounded-3xl border border-line bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
    >
      <View className="flex-row items-center gap-3">
        <View className="h-20 w-20 items-center justify-center rounded-2xl bg-brand-soft">
          <VehicleArt vehicle={order.vehicleType || "tow"} size={80} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-bold text-ink dark:text-white">
            {order.category}
          </Text>
          <Text className="mt-1 text-sm text-muted">{order.vehicle}</Text>
        </View>
        <ChevronRight size={20} color="#64746C" />
      </View>
      <View className="my-4 flex-row flex-wrap items-center justify-between gap-2">
        <StatusBadge status={labels[order.status]} />
        <Text className="text-lg font-bold text-ink dark:text-white">
          {order.amount.toLocaleString("pt-PT")} Kz
        </Text>
      </View>
      <View className="flex-row items-center gap-2">
        <MapPin size={15} color="#64746C" />
        <Text className="flex-1 text-sm text-muted" numberOfLines={2}>
          {order.address}
        </Text>
        {active ? (
          <>
            <Clock3 size={15} color="#087F4F" />
            <Text className="text-sm font-semibold text-brand">
              {order.etaMinutes} min
            </Text>
          </>
        ) : null}
      </View>
    </Pressable>
  );
}
