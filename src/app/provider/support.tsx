import { router } from "expo-router";
import { ScreenLayout } from "@/components/ui/ScreenLayout";
import { ListRow } from "@/components/ui/ListRow";
import { useOrderStore } from "@/stores/useOrderStore";
export default function ProviderSupport() {
  const order = useOrderStore((state) => state.selectedOrder);
  return (
    <ScreenLayout title="Apoio ao parceiro" subtitle="Ajuda em cada serviço">
      <ListRow
        title="Consultar o pedido actual"
        description={order.category}
        onPress={() => router.push(`/provider/request/${order.id}` as never)}
      />
      <ListRow
        title="Reportar um incidente"
        description="Registar uma ocorrência no pedido seleccionado."
        onPress={() => router.push("/order/complaint")}
      />
      <ListRow
        title="Dúvidas sobre transporte e cargas"
        description="Viaturas, acesso e apoio à carga."
        onPress={() => router.push("/support")}
      />
      <ListRow
        title="Documentos e aprovação"
        onPress={() => router.push("/provider/onboarding" as never)}
      />
    </ScreenLayout>
  );
}
