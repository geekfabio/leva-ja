import { useEffect } from "react";
import { Text, View, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Check } from "lucide-react-native";
import { AppButton } from "@/components/ui/AppButton";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { VehicleArt } from "@/components/transport/VehicleArt";
import { useRequestDraft } from "@/stores/useRequestDraft";
import { services } from "@/domain/catalog";
export default function ServiceScreen() {
  const { service } = useLocalSearchParams<{ service?: string }>();
  const selected = useRequestDraft((state) => state.service);
  const choose = useRequestDraft((state) => state.chooseService);
  useEffect(() => {
    const match = services.find((item) => item.id === service);
    if (match) choose(match.id);
  }, [service, choose]);
  return (
    <ScreenLayout
      title="O que vamos transportar?"
      subtitle="Passo 1 de 6"
      action={
        <AppButton
          label="Continuar"
          onPress={() => router.push("/request/incident" as never)}
        />
      }
    >
      <Text className="text-base leading-6 text-muted">
        Da mudança de casa ao apoio na estrada. Escolhe o serviço de que
        precisas.
      </Text>
      {["Transporte e mudanças", "Assistência automóvel"].map(
        (group, index) => (
          <View key={group}>
            <Text className="mb-3 text-lg font-bold text-ink dark:text-white">
              {group}
            </Text>
            <View accessibilityRole="radiogroup" className="gap-3">
              {services
                .filter((item) =>
                  index === 0 ? item.transport : !item.transport,
                )
                .map((item) => (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityLabel={item.name}
                    accessibilityState={{ checked: item.id === selected }}
                    key={item.id}
                    onPress={() => choose(item.id)}
                    className={`flex-row items-center rounded-3xl border pr-4 ${selected === item.id ? "border-brand bg-brand-soft dark:bg-green-950" : "border-line bg-white dark:border-slate-800 dark:bg-slate-900"}`}
                  >
                    <VehicleArt vehicle={item.vehicle} size={100} />
                    <View className="flex-1 py-4">
                      <Text className="text-base font-bold text-ink dark:text-white">
                        {item.name}
                      </Text>
                      <Text className="mt-1 text-sm leading-5 text-muted">
                        {item.description}
                      </Text>
                    </View>
                    <View
                      className={`ml-2 h-6 w-6 items-center justify-center rounded-full border ${selected === item.id ? "border-brand bg-brand" : "border-line"}`}
                    >
                      {selected === item.id ? (
                        <Check size={15} color="white" />
                      ) : null}
                    </View>
                  </Pressable>
                ))}
            </View>
          </View>
        ),
      )}
    </ScreenLayout>
  );
}
