import { Text, View } from "react-native";
import { Check } from "lucide-react-native";
import { OrderStatus } from "@/types/order";
export const serviceSteps: OrderStatus[] = [
  "matching",
  "accepted",
  "on_the_way",
  "arrived",
  "service_started",
  "completed",
];
export function ServiceTimeline({
  status,
  transport = false,
}: {
  status: OrderStatus;
  transport?: boolean;
}) {
  const labels = [
    "Pedido criado",
    "Parceiro confirmado",
    "A caminho da recolha",
    "No local",
    transport ? "Carga em transporte" : "Serviço em curso",
    transport ? "Entrega concluída" : "Serviço concluído",
  ];
  const rank = serviceSteps.indexOf(status);
  return (
    <View className="gap-4">
      {labels.map((label, index) => (
        <View key={label} className="flex-row items-center gap-3">
          <View
            className={`h-7 w-7 items-center justify-center rounded-full ${index <= rank ? "bg-brand" : "bg-line"}`}
          >
            {index <= rank ? (
              <Check size={15} color="white" />
            ) : (
              <Text className="text-xs text-muted">{index + 1}</Text>
            )}
          </View>
          <Text className="flex-1 text-sm font-semibold text-ink dark:text-white">
            {label}
            {rank === index ? " · agora" : ""}
          </Text>
        </View>
      ))}
    </View>
  );
}
