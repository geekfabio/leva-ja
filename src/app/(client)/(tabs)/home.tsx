import { useMemo, useRef } from "react";
import { View } from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowRight, Bell, ChevronRight, Radio, UserRound } from "lucide-react-native";
import {
  AppText,
  BrandLogo,
  EmptyState,
  ErrorState,
  IconButton,
  LoadingState,
  MapPreview,
  PrimaryButton,
  ServiceCard,
  ServiceTile,
  type MapMarker,
} from "@/components/kit";
import { serviceCatalog, serviceTitle } from "@/features/booking/catalog";
import { startBooking } from "@/features/booking/useBookingFlow";
import { clientScreenFor, isActiveStatus, statusLabel } from "@/features/service/stateMachine";
import { places } from "@/mocks/places";
import { useClientRequests } from "@/services/queries";
import { useSessionStore } from "@/stores/useSessionStore";
import { useRequest, useServiceStore } from "@/stores/useServiceStore";
import { go } from "@/features/navigation";
import { colors, radius } from "@/theme/colors";
import { toast } from "@/lib/toast";

const nearbyProviders: MapMarker[] = [
  { id: "me", kind: "user", coords: places.maianga.coords },
  { id: "p1", kind: "vehicle", coords: places.maculusso.coords, icon: "cargo" },
  { id: "p2", kind: "vehicle", coords: places.rangel.coords, icon: "tow" },
];

/** 11 · Início do cliente: mapa, serviços rápidos e serviços recentes. */
export default function ClientHome() {
  const user = useSessionStore((s) => s.user);
  const activeId = useServiceStore((s) => s.activeClientRequestId);
  const active = useRequest(activeId);
  const { data, isLoading, isError, refetch } = useClientRequests(user.id);
  const sheet = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["60%", "92%"], []);
  const recent = (data ?? []).filter((r) => !isActiveStatus(r.status)).slice(0, 3);
  const firstName = user.name.split(" ")[0];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ height: "48%" }}>
        <MapPreview height="100%" markers={nearbyProviders} pulse accessibilityLabel="Mapa de Luanda com prestadores próximos (simulado)" />
        <SafeAreaView edges={["top"]} style={{ position: "absolute", left: 0, right: 0, top: 0, paddingHorizontal: 16, paddingTop: 6, flexDirection: "row", alignItems: "flex-start" }}>
          <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.85)", alignSelf: "flex-start", borderRadius: radius.md, paddingHorizontal: 10, paddingVertical: 6 }}>
            <BrandLogo size="sm" tagline="Reboque • Carga • Mudança" />
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <IconButton variant="floating" label="Notificações" badge icon={<Bell size={22} color={colors.ink} />} onPress={() => toast.info({ title: "Sem novidades", message: "As notificações são simuladas nesta fase." })} />
            <IconButton variant="floating" label="Perfil" icon={<UserRound size={22} color={colors.ink} />} onPress={() => go("/account")} />
          </View>
        </SafeAreaView>
      </View>
      <BottomSheet ref={sheet} index={0} snapPoints={snapPoints} enableDynamicSizing={false} backgroundStyle={{ borderRadius: 28, backgroundColor: colors.background }} handleIndicatorStyle={{ backgroundColor: colors.borderStrong, width: 44 }}>
        <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 110, gap: 14 }}>
          <View>
            <AppText variant="h1" accessibilityRole="header">
              Olá, {firstName}
            </AppText>
            <AppText variant="body" style={{ fontSize: 17 }}>
              De que serviço precisas?
            </AppText>
          </View>
          {active && isActiveStatus(active.status) ? (
            <PrimaryButton
              label={`${serviceTitle[active.kind]} · ${statusLabel[active.status]}`}
              icon={<Radio size={20} color={colors.white} />}
              trailingIcon={<ChevronRight size={20} color={colors.white} />}
              onPress={() => go(clientScreenFor[active.status])}
              accessibilityHint="Abre o acompanhamento do pedido em curso"
            />
          ) : null}
          <View style={{ flexDirection: "row", gap: 10 }}>
            {serviceCatalog.slice(0, 3).map((service) => (
              <ServiceTile key={service.title} service={service} onPress={() => startBooking(service.kind, service.variant)} />
            ))}
          </View>
          <AppText variant="h3" accessibilityRole="header" style={{ marginTop: 6 }}>
            Serviços recentes
          </AppText>
          {isLoading ? (
            <LoadingState rows={3} />
          ) : isError ? (
            <ErrorState onRetry={refetch} />
          ) : recent.length ? (
            recent.map((request) => <ServiceCard key={request.id} request={request} onPress={() => go(`/trip/receipt?id=${request.id}`)} />)
          ) : (
            <EmptyState title="Ainda sem serviços" description="Os teus pedidos concluídos aparecem aqui." />
          )}
        </BottomSheetScrollView>
      </BottomSheet>
      <View style={{ position: "absolute", left: 20, right: 20, bottom: 14 }}>
        <PrimaryButton label="Pedir agora" onPress={() => go("/services")} trailingIcon={<ArrowRight size={22} color={colors.white} />} />
      </View>
    </View>
  );
}
