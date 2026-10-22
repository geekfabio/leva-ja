import { useRef, useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Settings, SlidersHorizontal } from "lucide-react-native";
import { AppText, BrandLogo, ChoiceChip, EmptyState, ErrorState, IconButton, LoadingState, OrderCard, PrimaryButton, ScreenContainer, SegmentedTabs, SheetModal, SelectionCard, ServiceIcon, Appear } from "@/components/kit";
import { AvailabilityToggle } from "@/components/partner/AvailabilityToggle";
import { NotificationBell, ProviderSummaryCard } from "@/components/partner/ProviderHeader";
import { serviceTitle } from "@/features/booking/catalog";
import { statusLabel } from "@/features/service/stateMachine";
import { repositories } from "@/data";
import { useMyProvider } from "@/features/provider/useProvider";
import { useNearbyRequests, useProviderRequests } from "@/services/queries";
import { useProviderStore } from "@/stores/useProviderStore";
import type { ServiceKind, ServiceRequest } from "@/types/domain";
import { go } from "@/features/navigation";
import { colors } from "@/theme/colors";

type Tab = "all" | "new" | "ongoing";
const kinds: ServiceKind[] = ["tow", "cargo", "small_move", "house_move"];
const distances = [5, 10, 20];

const ongoing = (r: ServiceRequest) => (r.status === "searching" && r.proposal?.status === "sent") || ["assigned", "en_route", "arrived", "pickup_confirmed", "in_transit"].includes(r.status);

/** 37 · Caixa de pedidos com filtros (novos, em curso, tipo e distância). */
export default function ProviderRequests() {
  const me = useMyProvider();
  const [tab, setTab] = useState<Tab>("all");
  const [kindFilter, setKindFilter] = useState<ServiceKind[]>(kinds);
  const [maxKm, setMaxKm] = useState(20);
  const filters = useRef<BottomSheetModal>(null);
  const online = useProviderStore((s) => s.online);
  const nearby = useNearbyRequests();
  const mine = useProviderRequests();
  const fresh = (nearby.data ?? []).filter((n) => kindFilter.includes(n.request.kind) && n.distanceKm <= maxKm);
  const current = (mine.data ?? []).filter(ongoing).map((request) => ({ request, distanceKm: Math.max(1, repositories().locations.distanceKm({ ...request.origin, coords: me.coords }, request.origin) - 1) }));
  const list = tab === "new" ? fresh : tab === "ongoing" ? current : [...current, ...fresh];
  const loading = nearby.isLoading || mine.isLoading;
  const error = nearby.isError || mine.isError;
  const open = (r: ServiceRequest) => go(r.status === "searching" ? (r.proposal?.status === "sent" ? `/partner/proposal/${r.id}` : `/partner/request/${r.id}`) : `/partner/active/${r.id}`);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView edges={["top"]} style={{ paddingHorizontal: 20, paddingTop: 6, flexDirection: "row", alignItems: "center" }}>
        <View style={{ flex: 1 }}>
          <BrandLogo size="md" tagline="Reboque · Carga · Mudanças" />
        </View>
        <NotificationBell />
        <IconButton label="Definições" icon={<Settings size={24} color={colors.ink} />} onPress={() => go("/settings")} />
      </SafeAreaView>
      <ScreenContainer edges={[]} gap={12} refreshing={nearby.isRefetching} onRefresh={() => { nearby.refetch(); mine.refetch(); }} contentStyle={{ paddingTop: 10 }}>
        <ProviderSummaryCard right={<AvailabilityToggle variant="pill" />} />
        <AppText variant="display" accessibilityRole="header" style={{ fontSize: 32 }}>
          Pedidos
        </AppText>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={{ flex: 1 }}>
            <SegmentedTabs
              value={tab}
              onChange={setTab}
              options={[
                { value: "all", label: "Todos" },
                { value: "new", label: "Novos", dot: fresh.length > 0 },
                { value: "ongoing", label: "Em curso" },
              ]}
            />
          </View>
          <IconButton variant="soft" label="Filtros" icon={<SlidersHorizontal size={22} color={colors.ink} />} onPress={() => filters.current?.present()} />
        </View>
        {loading ? (
          <LoadingState rows={3} />
        ) : error ? (
          <ErrorState onRetry={() => { nearby.refetch(); mine.refetch(); }} />
        ) : !online && tab !== "ongoing" && !current.length ? (
          <EmptyState title="Estás indisponível" description="Fica disponível para ver pedidos novos." actionLabel="Ficar disponível" onAction={() => useProviderStore.getState().setOnline(true)} />
        ) : list.length ? (
          list.map(({ request, distanceKm }, i) => (
            <Appear key={`${tab}-${request.id}`} index={i}>
            <OrderCard
              request={request}
              distanceKm={distanceKm}
              onPress={() => open(request)}
              badge={request.status === "searching" && request.proposal?.status !== "sent" ? undefined : { label: request.proposal?.status === "sent" && request.status === "searching" ? "Proposta enviada" : statusLabel[request.status], tone: "info" }}
            />
            </Appear>
          ))
        ) : (
          <EmptyState title={tab === "ongoing" ? "Sem serviços em curso" : "Sem pedidos com estes filtros"} description={tab === "ongoing" ? "Aceita um pedido novo para começar." : "Alarga a distância ou os tipos de serviço."} />
        )}
      </ScreenContainer>
      <SheetModal ref={filters} title="Filtrar pedidos">
        <AppText variant="label" weight="bold">
          Tipos de serviço
        </AppText>
        {kinds.map((k) => (
          <SelectionCard
            key={k}
            role="checkbox"
            indicator="check"
            title={serviceTitle[k]}
            selected={kindFilter.includes(k)}
            onPress={() => setKindFilter((f) => (f.includes(k) ? f.filter((x) => x !== k) : [...f, k]))}
            media={<ServiceIcon kind={k} size={24} color={colors.ink} />}
          />
        ))}
        <AppText variant="label" weight="bold">
          Distância máxima
        </AppText>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {distances.map((d) => (
            <ChoiceChip key={d} label={`Até ${d} km`} selected={maxKm === d} onPress={() => setMaxKm(d)} />
          ))}
        </View>
        <PrimaryButton label="Aplicar filtros" onPress={() => filters.current?.dismiss()} />
      </SheetModal>
    </View>
  );
}
