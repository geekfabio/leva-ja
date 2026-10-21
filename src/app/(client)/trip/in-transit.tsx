import { useRef } from "react";
import { View } from "react-native";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { ArrowLeft, Clock3, FileText, LocateFixed, Phone } from "lucide-react-native";
import { AppText, Card, IconButton, PriceSummary, PrimaryButton, ProviderCard, RouteTimeline, SecondaryButton, ServiceTimeline, SheetModal } from "@/components/kit";
import { ContactSheet } from "@/components/service/ContactSheet";
import { MapSheetLayout } from "@/components/service/MapSheetLayout";
import { NoActiveRequest } from "@/components/service/NoActiveRequest";
import { serviceTitle } from "@/features/booking/catalog";
import { describeLoad } from "@/features/booking/factory";
import { clientAutoAdvance } from "@/features/service/stateMachine";
import { useActiveClientRequest, useClientSimulation, useStageProgress, useStatusRoute } from "@/features/service/useClientSimulation";
import { findProvider } from "@/mocks/people";
import { mockRoute, pointAlong } from "@/utils/geo";
import { go } from "@/features/navigation";
import { toast } from "@/lib/toast";
import { colors } from "@/theme/colors";

/** 28 · Em transporte para o destino. */
export default function InTransitScreen() {
  const request = useActiveClientRequest();
  useClientSimulation(request);
  useStatusRoute(request, ["pickup_confirmed", "in_transit"]);
  const progress = useStageProgress(request, "in_transit", clientAutoAdvance.in_transit!.afterMs);
  const contact = useRef<BottomSheetModal>(null);
  const details = useRef<BottomSheetModal>(null);
  const provider = findProvider(request?.providerId);
  if (!request || !provider) return <NoActiveRequest />;
  const moving = request.status === "in_transit";
  const position = pointAlong(mockRoute(request.origin.coords, request.destination.coords), moving ? progress : 0);
  const eta = Math.max(1, Math.round(request.durationMin * (1 - (moving ? progress : 0))));
  const what = request.kind === "tow" ? "A tua viatura segue" : "A tua carga segue";

  return (
    <MapSheetLayout
      mapRatio={0.52}
      map={{
        route: { from: request.origin.coords, to: request.destination.coords },
        markers: [
          { id: "o", kind: "origin", coords: request.origin.coords, label: request.origin.area },
          { id: "v", kind: "vehicle", coords: position, icon: request.kind === "tow" ? "tow" : "cargo" },
          { id: "d", kind: "destination", coords: request.destination.coords, label: request.destination.area },
        ],
      }}
      overlay={
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <IconButton variant="floating" label="Voltar" icon={<ArrowLeft size={22} color={colors.ink} />} onPress={() => (router.canGoBack() ? router.back() : go("/home"))} />
          <IconButton variant="floating" label="Centrar mapa" icon={<LocateFixed size={22} color={colors.ink} />} onPress={() => toast.info("Mapa centrado na viatura")} />
        </View>
      }
      footer={
        <View style={{ flexDirection: "row", gap: 10 }}>
          <SecondaryButton style={{ flex: 1 }} label="Detalhes" icon={<FileText size={20} color={colors.primary} />} onPress={() => details.current?.present()} />
          <PrimaryButton style={{ flex: 1 }} label="Contactar" icon={<Phone size={20} color={colors.white} />} onPress={() => contact.current?.present()} />
        </View>
      }
    >
      <View style={{ gap: 4 }} accessibilityLiveRegion="polite">
        <AppText variant="h1" accessibilityRole="header">
          {moving ? "Em transporte" : "A preparar o transporte"}
        </AppText>
        <AppText variant="body" color={colors.text}>
          {what} para {request.destination.area}.
        </AppText>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
          <Clock3 size={22} color={colors.ink} />
          <AppText variant="title" weight="medium">
            Previsão de chegada:{" "}
            <AppText variant="title" color={colors.primary}>
              {eta} min
            </AppText>
          </AppText>
        </View>
      </View>
      <ServiceTimeline steps={["Recolha", "Em transporte", "Entrega"]} current={moving ? 1 : 0} />
      <Card>
        <ProviderCard provider={provider} layout="rating" onPress={() => contact.current?.present()} />
      </Card>
      <ContactSheet ref={contact} name={provider.name} onChat={() => { contact.current?.dismiss(); go("/trip/chat"); }} onCall={() => { contact.current?.dismiss(); go("/trip/call"); }} />
      <SheetModal ref={details} title={serviceTitle[request.kind]}>
        <AppText variant="caption" color={colors.muted}>
          Pedido {request.code} · {describeLoad(request)}
        </AppText>
        <RouteTimeline
          stops={[
            { label: "Recolha", place: request.origin.label },
            ...request.stops.map((s, i) => ({ label: `Paragem ${i + 1}`, place: s.label })),
            { label: "Entrega", place: request.destination.label },
          ]}
        />
        <PriceSummary price={request.price} totalLabel="Total a pagar" />
      </SheetModal>
    </MapSheetLayout>
  );
}
