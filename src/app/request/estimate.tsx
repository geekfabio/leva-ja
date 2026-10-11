import { Text } from "react-native";
import { router } from "expo-router";
import { AppButton } from "@/components/ui/AppButton";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { ListRow } from "@/components/ui/ListRow";
import { ServiceSummary } from "@/components/orders/ServiceSummary";
import { PriceSummary } from "@/components/orders/PriceSummary";
import { useRequestDraft, requestValid } from "@/stores/useRequestDraft";
import { getService, demoEstimate } from "@/domain/catalog";
export default function EstimateScreen() {
  const draft = useRequestDraft();
  const service = getService(draft.service);
  const price = demoEstimate(draft.vehicleType, draft.helpers);
  return (
    <ScreenLayout
      title="Tudo pronto para seguir?"
      subtitle="Passo 5 de 6"
      action={
        <AppButton
          label="Escolher pagamento"
          disabled={!requestValid(draft)}
          onPress={() => router.push("/request/payment" as never)}
        />
      }
    >
      <ServiceSummary
        service={service.name}
        vehicle={draft.vehicleType}
        origin={draft.address}
        destination={draft.destination}
        description={
          service.transport
            ? `${draft.cargoDescription} · ${draft.weightKg} kg · ${draft.dimensions}`
            : draft.customerVehicle
        }
      />
      <PriceSummary amount={price.total} pricing={price} />
      <ListRow
        title="Editar detalhes"
        description="Carga, apoio e acesso ao local"
        onPress={() => router.push("/request/incident" as never)}
      />
      <ListRow
        title="Alterar viatura"
        onPress={() => router.push("/request/vehicle")}
      />
      <ListRow
        title="Corrigir moradas"
        onPress={() => router.push("/request/location")}
      />
      <Text className="text-sm leading-6 text-muted">
        O teu pedido inclui as escolhas acima. A procura e os preços são
        simulados nesta demonstração.
      </Text>
    </ScreenLayout>
  );
}
