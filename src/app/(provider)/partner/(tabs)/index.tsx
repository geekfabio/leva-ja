import { useMemo } from "react";
import { View } from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronRight, LocateFixed, Navigation, Radio, SlidersHorizontal, Wallet } from "lucide-react-native";
import { AppText, Avatar, Card, EmptyState, ErrorState, IconButton, IconCircle, LoadingState, MapPreview, OrderCard, PrimaryButton, SecondaryButton, VehicleImage, type MapMarker, Appear, AnimatedAmount } from "@/components/kit";
import { AvailabilityToggle } from "@/components/partner/AvailabilityToggle";
import { serviceTitle } from "@/features/booking/catalog";
import { statusLabel } from "@/features/service/stateMachine";
import { usePendingProposal, useProviderActiveRequest } from "@/features/provider/useProviderActive";
import { useCurrentLocation, useFinanceSummary, useNearbyRequests } from "@/services/queries";
import { useProviderStore } from "@/stores/useProviderStore";
import { formatKz } from "@/utils/format";
import { go } from "@/features/navigation";
import { toast } from "@/lib/toast";
import { colors, radius } from "@/theme/colors";
import { useMyProvider } from "@/features/provider/useProvider";

/** 34 · Painel do prestador: disponibilidade, viatura, ganhos e pedidos próximos. */
export default function ProviderDashboard() {
  const online = useProviderStore((s) => s.online);
  const me = useMyProvider();
  const { data: currentLocation, refetch: refreshLocation, isFetching: locating } = useCurrentLocation();
  const vehicle = me.vehicle;
  const nearby = useNearbyRequests();
  const finance = useFinanceSummary();
  const active = useProviderActiveRequest();
  const proposal = usePendingProposal();
  const snapPoints = useMemo(() => ["62%", "92%"], []);
  const list = online ? (nearby.data ?? []) : [];
  const markers: MapMarker[] = [
    { id: "me", kind: "user", coords: currentLocation?.coords ?? me.coords },
    // Só os pedidos a menos de 6 km, para o mapa não afastar demasiado e sobrepor marcadores.
    ...list.filter((n) => n.distanceKm <= 6).slice(0, 4).map(({ request, distanceKm }) => ({
      id: request.id,
      kind: "request" as const,
      coords: request.origin.coords,
      bubble: `${distanceKm} km`,
      icon: request.kind === "tow" ? ("tow" as const) : request.kind === "cargo" ? ("cargo" as const) : ("move" as const),
    })),
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ height: "44%" }}>
        <MapPreview height="100%" markers={markers} accessibilityLabel="Mapa OpenStreetMap com pedidos próximos" />
        <SafeAreaView edges={["top"]} pointerEvents="box-none" style={{ position: "absolute", left: 16, right: 16, top: 4, flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
          <AvailabilityToggle variant="status" />
          <View style={{ gap: 10 }}>
            <IconButton variant="floating" label="Centrar na minha posição" icon={<LocateFixed size={22} color={colors.ink} />} onPress={() => { if (!locating) refreshLocation(); }} />
            <IconButton variant="floating" label="Navegação" icon={<Navigation size={22} color={colors.ink} />} onPress={() => (active ? go(`/partner/active/${active.id}`) : toast.info("Sem serviço activo para navegar"))} />
          </View>
        </SafeAreaView>
      </View>
      <BottomSheet index={0} snapPoints={snapPoints} enableDynamicSizing={false} backgroundStyle={{ borderRadius: 28, backgroundColor: colors.background }} handleIndicatorStyle={{ backgroundColor: colors.borderStrong, width: 44 }}>
        <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, gap: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Avatar name={me.name} initials={me.initials} photo={me.avatar} size={56} verified />
            <View style={{ flex: 1 }}>
              <AppText variant="h2" accessibilityRole="header">
                Olá, {me.name.split(" ")[0]}
              </AppText>
              <AppText variant="body" color={colors.muted}>
                {online ? "Estás disponível" : "Estás indisponível"}
              </AppText>
            </View>
          </View>
          {active ? (
            <PrimaryButton label={`${serviceTitle[active.kind]} · ${statusLabel[active.status]}`} icon={<Radio size={20} color={colors.white} />} trailingIcon={<ChevronRight size={20} color={colors.white} />} onPress={() => go(`/partner/active/${active.id}`)} accessibilityHint="Abre o serviço em curso" />
          ) : proposal ? (
            <SecondaryButton label="Proposta enviada · a aguardar cliente" onPress={() => go(`/partner/proposal/${proposal.id}`)} />
          ) : null}
          <Card onPress={() => go("/partner/vehicle")} accessibilityLabel={`${vehicle.brand} ${vehicle.model}, ${vehicle.plate}. Ver viatura`} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <VehicleImage art="pickup" width={110} height={64} />
            <View style={{ flex: 1 }}>
              <AppText variant="title">
                {vehicle.brand} {vehicle.model}
              </AppText>
              <AppText variant="label">{vehicle.plate}</AppText>
              <AppText variant="caption" color={colors.muted}>
                Reboque • Carga • Mudanças
              </AppText>
            </View>
            <ChevronRight size={20} color={colors.text} />
          </Card>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.deep, borderRadius: radius.lg, padding: 16 }}>
            <IconCircle tone="deep" size={48}>
              <Wallet size={24} color={colors.white} />
            </IconCircle>
            <View style={{ flex: 1 }} accessible accessibilityLabel={`Ganhos hoje: ${formatKz(finance.data?.today ?? 0)}`}>
              <AppText variant="caption" color="#D3EFDF">
                Ganhos hoje
              </AppText>
              {finance.data ? (
                <AnimatedAmount value={finance.data.today} variant="h2" color={colors.white} numberOfLines={1} />
              ) : (
                <AppText variant="h2" color={colors.white}>
                  —
                </AppText>
              )}
              <AppText variant="caption" color="#D3EFDF">
                {finance.data?.todayCount ?? 0} serviços concluídos
              </AppText>
            </View>
            <PrimaryButton size="sm" label="Ver ganhos" trailingIcon={<ChevronRight size={16} color={colors.white} />} style={{ backgroundColor: "rgba(255,255,255,0.16)" }} onPress={() => go("/partner/earnings")} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <AppText variant="h3" accessibilityRole="header">
              Pedidos próximos
            </AppText>
            <IconButton label="Filtrar pedidos" icon={<SlidersHorizontal size={22} color={colors.ink} />} onPress={() => go("/partner/requests")} />
          </View>
          {!online ? (
            <EmptyState title="Estás indisponível" description="Activa a disponibilidade para receber pedidos próximos." actionLabel="Ficar disponível" onAction={() => useProviderStore.getState().setOnline(true)} />
          ) : nearby.isLoading ? (
            <LoadingState rows={2} />
          ) : nearby.isError ? (
            <ErrorState onRetry={nearby.refetch} />
          ) : list.length ? (
            list.slice(0, 4).map(({ request, distanceKm }, i) => (
              <Appear key={request.id} index={i}>
                <OrderCard variant="row" request={request} distanceKm={distanceKm} onPress={() => go(`/partner/request/${request.id}`)} />
              </Appear>
            ))
          ) : (
            <EmptyState title="Sem pedidos por perto" description="Vamos avisar-te quando surgir um pedido na tua zona." />
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
}
