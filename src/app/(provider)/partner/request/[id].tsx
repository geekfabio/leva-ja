import { useCallback } from "react";
import { Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, BadgeCheck, ChevronRight, Coins, MapPin, Package, Users } from "lucide-react-native";
import { AppHeader, AppText, CountdownRing, DangerButton, EmptyState, IconButton, IconCircle, InfoNote, PhotoTile, PrimaryButton, ScreenContainer, ServiceIcon, VehicleImage, AnimatedAmount } from "@/components/kit";
import { MapSheetLayout } from "@/components/service/MapSheetLayout";
import { serviceTitle } from "@/features/booking/catalog";
import { describeLoad } from "@/features/booking/factory";
import { needsProposal } from "@/features/booking/pricing";
import { currentProvider, findClient } from "@/mocks/people";
import { useProviderStore } from "@/stores/useProviderStore";
import { useRequest, useServiceStore } from "@/stores/useServiceStore";
import { formatFloor, formatKm, formatKz } from "@/utils/format";
import { swap } from "@/features/navigation";
import { toast } from "@/lib/toast";
import { colors, radius } from "@/theme/colors";

function InfoRow({ icon, children, onPress }: { icon: React.ReactNode; children: React.ReactNode; onPress?: () => void }) {
  return (
    <Pressable disabled={!onPress} onPress={onPress} accessibilityRole={onPress ? "button" : undefined} style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#F1F4F2", borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12 }}>
      {icon}
      <View style={{ flex: 1 }}>{children}</View>
      {onPress ? <ChevronRight size={20} color={colors.text} /> : null}
    </Pressable>
  );
}

/** 35 · Novo pedido: avaliar distância, carga, ajudante e ganho antes de aceitar. */
export default function NewRequestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const request = useRequest(id);
  const online = useProviderStore((s) => s.online);
  const vehicle = useProviderStore((s) => s.vehicle);
  const expire = useCallback(() => {
    if (!id) return;
    useServiceStore.getState().decline(id);
    toast.info({ title: "Pedido expirado", message: "O pedido foi passado a outro prestador." });
    if (router.canGoBack()) router.back();
  }, [id]);
  if (!request || request.status !== "searching")
    return (
      <ScreenContainer header={<AppHeader />}>
        <EmptyState title="Pedido indisponível" description="Este pedido já foi aceite por outro prestador ou cancelado." actionLabel="Ver outros pedidos" onAction={() => swap("/partner/requests")} />
      </ScreenContainer>
    );
  const client = findClient(request.clientId);
  const proposal = needsProposal(request.kind);
  const helpers = request.cargo?.helper ? 1 : (request.moving?.helpers ?? 0);
  const accept = () => {
    if (proposal) return swap(`/partner/proposal/${request.id}`);
    if (useServiceStore.getState().accept(request.id, currentProvider.id)) {
      toast.success({ title: "Pedido aceite", message: `Dirige-te a ${request.origin.area}.` });
      swap(`/partner/active/${request.id}`);
    }
  };
  const decline = () => {
    useServiceStore.getState().decline(request.id);
    toast.info("Pedido recusado");
    router.back();
  };

  return (
    <MapSheetLayout
      mapRatio={0.36}
      map={{
        route: { from: request.origin.coords, to: request.destination.coords },
        markers: [
          { id: "o", kind: "origin", coords: request.origin.coords, label: request.origin.area },
          { id: "d", kind: "destination", coords: request.destination.coords, label: request.destination.area },
        ],
      }}
      overlay={<IconButton variant="floating" label="Voltar" icon={<ArrowLeft size={22} color={colors.ink} />} onPress={() => router.back()} />}
      footer={
        <View style={{ gap: 8 }}>
          {!online ? <InfoNote tone="warning">Estás indisponível. Fica disponível para aceitar pedidos.</InfoNote> : null}
          <View style={{ flexDirection: "row", gap: 10 }}>
            <DangerButton tone="outline" style={{ flex: 1 }} label="Recusar" onPress={decline} />
            <PrimaryButton style={{ flex: 1.3 }} label={proposal ? "Propor valor" : "Aceitar pedido"} disabled={!online} onPress={accept} />
          </View>
        </View>
      }
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <IconCircle size={60} tone="primary">
          <ServiceIcon kind={request.kind} size={30} color={colors.white} />
        </IconCircle>
        <View style={{ flex: 1 }}>
          <AppText variant="h1" accessibilityRole="header">
            Novo pedido
          </AppText>
          <AppText variant="body" style={{ fontSize: 17 }}>
            {serviceTitle[request.kind]}
          </AppText>
        </View>
        <CountdownRing seconds={30} onExpire={expire} paused={!online} />
      </View>
      <InfoRow icon={<MapPin size={26} color={colors.white} fill={colors.accent} />}>
        <AppText variant="h3">
          {request.origin.area} → {request.destination.area}
        </AppText>
        <AppText variant="caption" color={colors.muted}>
          {formatKm(request.distanceKm)} · {request.origin.label}
        </AppText>
      </InfoRow>
      <InfoRow icon={<VehicleImage art="pickup" width={90} height={54} />}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <AppText variant="title">{currentProvider.name}</AppText>
          <BadgeCheck size={16} color={colors.white} fill={colors.accent} />
        </View>
        <AppText variant="caption" color={colors.muted}>
          Prestador verificado
        </AppText>
        <AppText variant="caption">
          {vehicle.brand} {vehicle.model} | {vehicle.plate}
        </AppText>
      </InfoRow>
      <InfoRow icon={<Users size={22} color={colors.ink} />}>
        <AppText variant="body">
          Cliente: <AppText variant="body" weight="bold">{client.name}</AppText>
        </AppText>
      </InfoRow>
      <InfoRow icon={<Package size={22} color={colors.ink} />}>
        <AppText variant="body">
          <AppText variant="body" weight="bold">
            {request.kind === "tow" ? "Viatura: " : "Carga: "}
          </AppText>
          {describeLoad(request)}
        </AppText>
        {request.moving ? (
          <AppText variant="caption" color={colors.muted}>
            {formatFloor(request.moving.pickupFloor)} → {formatFloor(request.moving.deliveryFloor)} · {request.moving.elevator ? "com elevador" : "sem elevador"}
          </AppText>
        ) : null}
        {request.photos.length ? (
          <View style={{ flexDirection: "row", gap: 6, marginTop: 8 }}>
            {request.photos.slice(0, 4).map((p) => (
              <PhotoTile key={p.id} photo={p} size={56} />
            ))}
          </View>
        ) : null}
      </InfoRow>
      {helpers ? (
        <InfoRow icon={<Users size={22} color={colors.primary} />}>
          <AppText variant="body" weight="bold">
            {helpers === 1 ? "Precisa de ajudante" : `Precisa de ${helpers} ajudantes`}
          </AppText>
        </InfoRow>
      ) : null}
      {request.instructions ? <InfoNote title="Instruções do cliente">{request.instructions}</InfoNote> : null}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.primarySoft, borderRadius: radius.lg, padding: 16 }}>
        <Coins size={30} color={colors.ink} />
        <View>
          <AppText variant="caption">{proposal ? "Valor sugerido (podes ajustar)" : "Estimativa de ganho"}</AppText>
<AnimatedAmount value={request.providerEarning} weight="extrabold" style={{ fontSize: 32, lineHeight: 38 }} />
        </View>
      </View>
    </MapSheetLayout>
  );
}
