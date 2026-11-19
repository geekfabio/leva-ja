import { View } from "react-native";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { AppText, ContactActions, IconButton, ProviderCard, ServiceTimeline, TextButton, Appear } from "@/components/kit";
import { MapSheetLayout } from "@/components/service/MapSheetLayout";
import { NoActiveRequest } from "@/components/service/NoActiveRequest";
import { callPhone } from "@/features/service/contact";
import { useActiveClientRequest, useProviderLocationPolling, useStatusRoute } from "@/features/service/useActiveRequest";
import { useAnimatedProviderPosition } from "@/features/service/useProviderPosition";
import { useTripProgress } from "@/features/service/useTripProgress";
import { unreadCount, useChatStore } from "@/stores/useChatStore";
import { go } from "@/features/navigation";
import { colors } from "@/theme/colors";

/** 23 · Acompanhamento em tempo real: posição real do prestador a caminho. */
export default function TrackingScreen() {
  const request = useActiveClientRequest();
  useStatusRoute(request, ["assigned", "en_route"]);
  useProviderLocationPolling(request);
  const { etaMin, route } = useTripProgress(request);
  const unread = useChatStore((s) => unreadCount(request ? s.threads[request.id] : undefined, "client"));
  const provider = request?.provider;
  const position = useAnimatedProviderPosition(provider?.coords);
  if (!request || !provider) return <NoActiveRequest />;
  const step = request.status === "assigned" ? 0 : etaMin !== undefined && etaMin <= 2 ? 2 : 1;

  return (
    <MapSheetLayout
      mapRatio={0.55}
      map={{
        route: { from: provider.coords, to: request.origin.coords, points: route?.points },
        markers: [
          { id: "v", kind: "vehicle", coords: position ?? provider.coords, icon: request.kind === "tow" ? "tow" : "cargo" },
          { id: "o", kind: "destination", coords: request.origin.coords, label: request.origin.area },
        ],
      }}
      overlay={
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <IconButton variant="floating" label="Voltar ao início" icon={<ArrowLeft size={22} color={colors.ink} />} onPress={() => (router.canGoBack() ? router.back() : go("/home"))} />
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
            {etaMin !== undefined ? `Chega em ${etaMin} min` : "A calcular a chegada…"}
          </AppText>
        </View>
      </Appear>
      <ServiceTimeline kind={request.kind} steps={["Pedido aceite", "A caminho de ti", "A chegar", "No local"]} current={step} />
      <ContactActions unread={unread} onChat={() => go("/trip/chat")} onCall={() => callPhone(provider.phone)} />
      <TextButton size="sm" label="Preciso de ajuda" onPress={() => go("/help")} />
    </MapSheetLayout>
  );
}
