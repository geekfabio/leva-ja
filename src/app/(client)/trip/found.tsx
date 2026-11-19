import { useRef } from "react";
import { View } from "react-native";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Map as MapIcon, Phone } from "lucide-react-native";
import { AppText, PrimaryButton, ProviderCard, SecondaryButton, VehicleRow } from "@/components/kit";
import { ContactSheet } from "@/components/service/ContactSheet";
import { MapSheetLayout } from "@/components/service/MapSheetLayout";
import { NoActiveRequest } from "@/components/service/NoActiveRequest";
import { callPhone } from "@/features/service/contact";
import { useActiveClientRequest, useStatusRoute } from "@/features/service/useActiveRequest";
import { useTripProgress } from "@/features/service/useTripProgress";
import { go } from "@/features/navigation";
import { colors } from "@/theme/colors";

/** 22 · Prestador encontrado. */
export default function FoundScreen() {
  const request = useActiveClientRequest();
  useStatusRoute(request, ["assigned", "en_route"]);
  const contact = useRef<BottomSheetModal>(null);
  const provider = request?.provider;
  const { etaMin: eta, route } = useTripProgress(request);
  if (!request || !provider) return <NoActiveRequest />;
  return (
    <MapSheetLayout
      mapRatio={0.45}
      map={{
        route: { from: provider.coords, to: request.origin.coords, points: route?.points },
        markers: [
          { id: "v", kind: "vehicle", coords: provider.coords, bubble: eta !== undefined ? `Chega em ${eta} min` : undefined, icon: request.kind === "tow" ? "tow" : "cargo" },
          { id: "o", kind: "destination", coords: request.origin.coords, label: request.origin.area },
        ],
      }}
      footer={
        <>
          <PrimaryButton label="Ver no mapa" icon={<MapIcon size={22} color={colors.white} />} onPress={() => go("/trip/tracking")} />
          <SecondaryButton label="Contactar" icon={<Phone size={20} color={colors.primary} />} onPress={() => contact.current?.present()} />
        </>
      }
    >
      <View style={{ alignItems: "center", gap: 8 }}>
        <AppText variant="h2" align="center" accessibilityRole="header" accessibilityLiveRegion="polite">
          Prestador encontrado!
        </AppText>
        <View style={{ width: 48, height: 4, borderRadius: 2, backgroundColor: colors.accent }} />
      </View>
      <ProviderCard provider={provider} layout="stacked" />
      <VehicleRow provider={provider} eta={eta} />
      <ContactSheet
        ref={contact}
        name={provider.name}
        onChat={() => {
          contact.current?.dismiss();
          go("/trip/chat");
        }}
        onCall={() => {
          contact.current?.dismiss();
          callPhone(provider.phone);
        }}
      />
    </MapSheetLayout>
  );
}
