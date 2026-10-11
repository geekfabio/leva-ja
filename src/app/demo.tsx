import { UserRound, Truck } from "lucide-react-native";
import { useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { SelectionCard } from "@/components/ui/SelectionCard";
import { VehicleArt } from "@/components/transport/VehicleArt";
import { useOrderStore } from "@/stores/useOrderStore";
import { demoScenarios } from "@/mocks/demo";
import { money } from "@/domain/catalog";

export default function DemoCenter() {
  const [audience, setAudience] = useState<"customer" | "provider">("customer");
  const loadScenario = useOrderStore((state) => state.loadScenario);
  return (
    <ScreenLayout
      title="Experimenta a Leva Já"
      subtitle="Demonstração com dados fictícios"
    >
      <View className="rounded-3xl bg-brand-bright p-5">
        <Text className="text-2xl font-bold text-ink">
          Uma app. Tudo o que precisas de transportar.
        </Text>
        <Text className="mt-3 text-base leading-6 text-ink">
          Explora cargas, mudanças e assistência como cliente ou parceiro. Os
          pedidos e pagamentos são simulados.
        </Text>
      </View>
      <Text className="mt-6 text-lg font-bold text-ink dark:text-white">
        Escolhe o teu perfil
      </Text>
      <SelectionCard
        icon={<UserRound size={24} color="#087F4F" />}
        title="Cliente"
        description="Acompanha o pedido e a entrega."
        selected={audience === "customer"}
        onPress={() => setAudience("customer")}
      />
      <SelectionCard
        icon={<Truck size={24} color="#087F4F" />}
        title="Parceiro"
        description="Aceita, recolhe e conclui o serviço."
        selected={audience === "provider"}
        onPress={() => setAudience("provider")}
      />
      <Text className="mt-4 text-lg font-bold text-ink dark:text-white">
        Pedidos prontos para explorar
      </Text>
      <Text className="text-sm leading-5 text-muted">
        Abrir um exemplo repõe os pedidos da demonstração e coloca o parceiro
        online. Podes voltar aqui para recomeçar.
      </Text>
      {demoScenarios.map((scenario) => {
        const order = scenario.orders.find(
          (item) => item.id === scenario.orderId,
        )!;
        return (
          <AppCard key={scenario.id}>
            <View className="flex-row items-center gap-3">
              <VehicleArt vehicle={order.vehicleType ?? "tow"} size={100} />
              <View className="flex-1">
                <Text className="text-lg font-bold text-ink dark:text-white">
                  {scenario.title}
                </Text>
                <Text className="mt-1 font-semibold text-brand">
                  {money(order.amount)} · valor simulado
                </Text>
              </View>
            </View>
            <Text className="mb-4 text-sm leading-6 text-muted">
              {scenario.description}
            </Text>
            <AppButton
              label={`Explorar ${scenario.title.toLowerCase()}`}
              onPress={() => {
                loadScenario(scenario);
                const target =
                  scenario.id === "dispute"
                    ? "/admin/detail/safety/SOS-40"
                    : audience === "provider"
                      ? `/provider/request/${order.id}`
                      : scenario.id === "payment-failed"
                        ? "/request/payment-result"
                        : `/order/${order.id}`;
                router.push(target as never);
              }}
            />
          </AppCard>
        );
      })}
    </ScreenLayout>
  );
}
