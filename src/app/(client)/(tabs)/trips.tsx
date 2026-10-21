import { useState } from "react";
import { View } from "react-native";
import { Truck } from "lucide-react-native";
import { AppHeader, AppText, EmptyState, ErrorState, LoadingState, ScreenContainer, SegmentedTabs, ServiceCard, Appear } from "@/components/kit";
import { clientScreenFor, isActiveStatus } from "@/features/service/stateMachine";
import { useClientRequests } from "@/services/queries";
import { useServiceStore } from "@/stores/useServiceStore";
import { useSessionStore } from "@/stores/useSessionStore";
import { go } from "@/features/navigation";
import type { ServiceRequest } from "@/types/domain";

type Filter = "active" | "done" | "cancelled";

/** Histórico de serviços do cliente ("As minhas viagens"). */
export default function TripsScreen() {
  const userId = useSessionStore((s) => s.user.id);
  const [filter, setFilter] = useState<Filter>("active");
  const { data, isLoading, isError, refetch, isRefetching } = useClientRequests(userId);
  const list = (data ?? []).filter((r) =>
    filter === "active" ? isActiveStatus(r.status) && r.status !== "cancelled" : filter === "done" ? ["paid", "rated"].includes(r.status) : r.status === "cancelled",
  );
  const open = (r: ServiceRequest) => {
    if (isActiveStatus(r.status)) {
      useServiceStore.getState().setActiveClient(r.id);
      go(clientScreenFor[r.status]);
    } else go(`/trip/receipt?id=${r.id}`);
  };
  return (
    <ScreenContainer header={<AppHeader back={false} title="As minhas viagens" />} refreshing={isRefetching} onRefresh={refetch} gap={12}>
      <SegmentedTabs
        variant="segmented"
        value={filter}
        onChange={setFilter}
        options={[
          { value: "active", label: "Em curso", dot: (data ?? []).some((r) => isActiveStatus(r.status) && r.status !== "cancelled") },
          { value: "done", label: "Concluídas" },
          { value: "cancelled", label: "Canceladas" },
        ]}
      />
      {isLoading ? (
        <LoadingState rows={4} />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : list.length ? (
        <View style={{ gap: 10 }}>
          {list.map((r, i) => (
            <Appear key={`${filter}-${r.id}`} index={i}>
              <ServiceCard request={r} onPress={() => open(r)} />
            </Appear>
          ))}
          <AppText variant="caption" align="center" style={{ opacity: 0.6 }}>
            {list.length} {list.length === 1 ? "serviço" : "serviços"}
          </AppText>
        </View>
      ) : (
        <EmptyState
          icon={<Truck size={32} color="#0A8743" />}
          title={filter === "active" ? "Sem pedidos em curso" : filter === "done" ? "Ainda sem serviços concluídos" : "Sem pedidos cancelados"}
          description="Quando fizeres um pedido, acompanhas tudo aqui."
          actionLabel={filter === "active" ? "Pedir um serviço" : undefined}
          onAction={() => go("/services")}
        />
      )}
    </ScreenContainer>
  );
}
