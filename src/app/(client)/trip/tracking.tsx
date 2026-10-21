import { View } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, LocateFixed } from "lucide-react-native";
import { AppText, ContactActions, IconButton, ProviderCard, ServiceTimeline, TextButton, Appear } from "@/components/kit";
import { MapSheetLayout } from "@/components/service/MapSheetLayout";
import { NoActiveRequest } from "@/components/service/NoActiveRequest";
import { clientAutoAdvance } from "@/features/service/stateMachine";
import { useActiveClientRequest, useClientSimulation, useStageProgress, useStatusRoute } from "@/features/service/useClientSimulation";
import { findProvider } from "@/mocks/people";
import { approachStart, mockRoute, pointAlong } from "@/utils/geo";
import { unreadCount, useChatStore } from "@/stores/useChatStore";
import { go } from "@/features/navigation";
import { toast } from "@/lib/toast";
import { colors } from "@/theme/colors";

const ETA_MIN = 8;

/** 23 · Acompanhamento em tempo real: prestador a caminho. */
export default function TrackingScreen() {
  const request = useActiveClientRequest();
  useClientSimulation(request);
  useStatusRoute(request, ["assigned", "en_route"]);
  const progress = useStageProgress(request, "en_route", clientAutoAdvance.en_route!.afterMs);
  const unread = useChatStore((s) => unreadCount(request ? s.threads[request.id] : undefined, "client"));
  const provider = findProvider(request?.providerId);
  if (!request || !provider) return <NoActiveRequest />;
  const route = mockRoute(approachStart(request.origin.coords), request.origin.coords);
  const position = request.status === "en_route" ? pointAlong(route, progress) : approachStart(request.origin.coords);
  const eta = request.status === "en_route" ? Math.max(1, Math.round(ETA_MIN * (1 - progress))) : ETA_MIN;
  const step = request.status === "assigned" ? 0 : eta <= 2 ? 2 : 1;

  return (
    <MapSheetLayout
      mapRatio={0.55}
      map={{
        route: { from: approachStart(request.origin.coords), to: request.origin.coords },
        markers: [
          { id: "v", kind: "vehicle", coords: position, icon: request.kind === "tow" ? "tow" : "cargo" },
          { id: "o", kind: "destination", coords: request.origin.coords, label: request.origin.area },
        ],
      }}
      overlay={
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <IconButton variant="floating" label="Voltar ao início" icon={<ArrowLeft size={22} color={colors.ink} />} onPress={() => (router.canGoBack() ? router.back() : go("/home"))} />
          <IconButton variant="floating" label="Centrar mapa" icon={<LocateFixed size={22} color={colors.ink} />} onPress={() => toast.info("Mapa centrado no prestador")} />
        </View>
      }
    >
      <ProviderCard provider={provider} />
      <Appear key={`step-${step}`} from="fade" style={{ gap: 0 }}>
        <View accessibilityLiveRegion="polite">
        <AppText variant="h1" accessibilityRole="header">
          {step === 2 ? "Quase a chegar" : "A caminho de ti"}
        </AppText>
        <AppText variant="title" color={colors.primary}>
          Chega em {eta} min
        </AppText>
        </View>
      </Appear>
      <ServiceTimeline kind={request.kind} steps={["Pedido aceite", "A caminho de ti", "A chegar", "No local"]} current={step} />
      <ContactActions
        unread={unread}
        onChat={() => go("/trip/chat")}
        onCall={() => go("/trip/call")}
        onShare={() => toast.success({ title: "Link copiado", message: "Partilha o acompanhamento com quem quiseres (simulado)." })}
      />
      <TextButton size="sm" label="Preciso de ajuda" onPress={() => go("/help")} />
    </MapSheetLayout>
  );
}
