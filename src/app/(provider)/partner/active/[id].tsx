import { useRef } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { ArrowLeft, Camera, Clock3, Ellipsis, Flag, Layers, LocateFixed, PackageCheck, Siren } from "lucide-react-native";
import { AppHeader, AppText, Avatar, Card, ContactActions, EmptyState, IconButton, InfoNote, ListRow, PrimaryButton, ScreenContainer, SecondaryButton, ServiceTimeline, SheetModal, StatusBadge, VehicleImage } from "@/components/kit";
import { MapSheetLayout } from "@/components/service/MapSheetLayout";
import { serviceTitle } from "@/features/booking/catalog";
import { providerAction, statusLabel } from "@/features/service/stateMachine";
import { repositories } from "@/data";
import { useRequest, useServiceStore } from "@/stores/useServiceStore";
import { unreadCount, useChatStore } from "@/stores/useChatStore";
import { formatKz } from "@/utils/format";
import { go, swap } from "@/features/navigation";
import { toast } from "@/lib/toast";
import { colors } from "@/theme/colors";
import { clientOf } from "@/features/service/people";
import { useMyProvider } from "@/features/provider/useProvider";

const subtitleFor: Record<string, (to: string, from: string) => string> = {
  assigned: (_, from) => `A aguardar deslocação para ${from}`,
  en_route: (_, from) => `A caminho de ${from}`,
  arrived: () => "No local de recolha",
  pickup_confirmed: (to) => `Recolha confirmada · destino ${to}`,
  in_transit: (to) => `Em transporte para ${to}`,
  delivered: () => "Entregue · a aguardar pagamento",
  paid: () => "Pago pelo cliente",
  rated: () => "Serviço concluído",
};

/** 36 · Serviço em curso: navegar, contactar o cliente e actualizar o estado. */
export default function ActiveServiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const request = useRequest(id);
  const me = useMyProvider();
  const vehicle = me.vehicle;
  const unread = useChatStore((s) => unreadCount(id ? s.threads[id] : undefined, "provider"));
  const more = useRef<BottomSheetModal>(null);
  if (!request || request.status === "searching" || request.status === "cancelled")
    return (
      <ScreenContainer header={<AppHeader title="Serviço em curso" />}>
        <EmptyState title={request?.status === "cancelled" ? "Serviço cancelado" : "Sem serviço activo"} description={request?.cancelReason ?? "Aceita um pedido para o gerires aqui."} actionLabel="Voltar ao painel" onAction={() => swap("/partner")} />
      </ScreenContainer>
    );
  const client = clientOf(request);
  const action = providerAction[request.status];
  const step = ["assigned", "en_route", "arrived"].includes(request.status) ? 0 : request.status === "pickup_confirmed" ? 1 : request.status === "in_transit" ? 1 : 2;
  const going = ["assigned", "en_route"].includes(request.status);
  const start = me.coords;
  const steps = going ? ["Pedido aceite", "A caminho", "No local"] : ["Recolha concluída", "Em transporte", "Confirmar entrega"];
  const stepIndex = going ? (request.status === "assigned" ? 0 : 1) : step === 0 ? 0 : step;
  const eta = going ? 8 : Math.round(request.durationMin / 2);

  const run = async () => {
    if (!action) return;
    if (action.to === "proof") return go(`/partner/proof/${request.id}`);
    const ok = await useServiceStore.getState().transition(request.id, action.to, action.to === "pickup_confirmed" ? "system" : "provider");
    if (ok) toast.success(statusLabel[action.to]);
    else toast.error({ title: "Não foi possível actualizar", message: useServiceStore.getState().lastError ?? undefined });
  };
  const registerPhotos = async () => {
    const photos = await repositories().media.pickupSet();
    if (await useServiceStore.getState().addPickupPhotos(request.id, photos)) toast.success({ title: "Fotos registadas", message: "O cliente vai rever e confirmar a recolha." });
  };

  const footer = (() => {
    if (request.status === "arrived")
      return (
        <>
          {!request.pickupPhotos.length ? (
            <PrimaryButton label="Registar fotos da carga" icon={<Camera size={22} color={colors.white} />} onPress={registerPhotos} />
          ) : (
            <InfoNote tone="soft" title="A aguardar o cliente">O cliente está a confirmar a recolha na app.</InfoNote>
          )}
          <SecondaryButton label="Simular confirmação do cliente" disabled={!request.pickupPhotos.length} onPress={run} />
        </>
      );
    if (action) return <PrimaryButton label={action.label} icon={action.to === "proof" ? <PackageCheck size={22} color={colors.white} /> : undefined} onPress={run} />;
    return <PrimaryButton label="Voltar ao painel" onPress={() => swap("/partner")} />;
  })();

  return (
    <MapSheetLayout
      mapRatio={0.46}
      map={{
        route: going ? { from: start, to: request.origin.coords } : { from: request.origin.coords, to: request.destination.coords, coordinates: request.routeGeometry },
        markers: going
          ? [
              { id: "v", kind: "vehicle", coords: start, icon: request.kind === "tow" ? "tow" : "cargo" },
              { id: "o", kind: "destination", coords: request.origin.coords, label: request.origin.area },
            ]
          : [
              { id: "o", kind: "origin", coords: request.origin.coords, label: request.origin.area },
              { id: "v", kind: "vehicle", coords: request.status === "in_transit" ? { latitude: (request.origin.coords.latitude + request.destination.coords.latitude) / 2, longitude: (request.origin.coords.longitude + request.destination.coords.longitude) / 2 } : request.origin.coords, icon: request.kind === "tow" ? "tow" : "cargo" },
              { id: "d", kind: "destination", coords: request.destination.coords, label: request.destination.area },
            ],
      }}
      overlay={
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <IconButton variant="floating" label="Voltar" icon={<ArrowLeft size={22} color={colors.ink} />} onPress={() => (router.canGoBack() ? router.back() : swap("/partner"))} />
            <View style={{ backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 }}>
              <AppText variant="h3">Serviço em curso</AppText>
            </View>
            <IconButton variant="floating" label="Mais opções" icon={<Ellipsis size={22} color={colors.ink} />} onPress={() => more.current?.present()} />
          </View>
          <View style={{ alignItems: "flex-end", gap: 10 }}>
            <IconButton variant="floating" label="Centrar" icon={<LocateFixed size={22} color={colors.ink} />} onPress={() => toast.info("Mapa centrado")} />
            <IconButton variant="floating" label="Camadas do mapa" icon={<Layers size={22} color={colors.ink} />} onPress={() => toast.info("Camadas indisponíveis no mapa simulado")} />
          </View>
        </View>
      }
      footer={footer}
    >
      <Card style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <VehicleImage art="pickup" width={96} height={58} />
        <View style={{ flex: 1 }}>
          <AppText variant="h3">{serviceTitle[request.kind]}</AppText>
          <AppText variant="caption" color={colors.muted}>
            {vehicle.brand} {vehicle.model} • {vehicle.plate}
          </AppText>
        </View>
        <StatusBadge label="Verificado" tone="success" icon="check" />
      </Card>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Avatar name={client.name} initials={client.initials} photo={client.avatar} size={56} />
        <View style={{ flex: 1 }}>
          <AppText variant="h3">{client.name}</AppText>
          <AppText variant="caption" color={colors.muted}>
            {subtitleFor[request.status]?.(request.destination.area, request.origin.area)}
          </AppText>
        </View>
        <ContactActions variant="compact" unread={unread} onChat={() => go(`/partner/chat/${request.id}`)} onCall={() => go(`/partner/call/${request.id}`)} />
      </View>
      <ServiceTimeline steps={steps} current={stepIndex} />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.primarySoft, borderRadius: 14, padding: 14 }}>
        <Clock3 size={22} color={colors.ink} />
        <AppText variant="title" weight="medium">
          Previsão: <AppText variant="title">{eta} min</AppText>
        </AppText>
        <View style={{ flex: 1 }} />
        <AppText variant="label" color={colors.primary}>
          Ganho {formatKz(request.providerEarning)}
        </AppText>
      </View>
      <SheetModal ref={more} title="Opções do serviço">
        <ListRow variant="plain" icon={<Flag size={22} color={colors.ink} />} title="Reportar um problema" onPress={() => { more.current?.dismiss(); go("/help/report"); }} />
        <ListRow variant="plain" icon={<Siren size={22} color={colors.danger} />} title="SOS" subtitle="Alerta a equipa de segurança" onPress={() => { more.current?.dismiss(); go("/sos"); }} />
      </SheetModal>
    </MapSheetLayout>
  );
}
