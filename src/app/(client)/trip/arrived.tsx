import { useRef } from "react";
import { View } from "react-native";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { ArrowRight, Phone, ShieldCheck } from "lucide-react-native";
import { AppText, Card, PhotoTile, PlateTag, PrimaryButton, SecondaryButton, VehicleImage } from "@/components/kit";
import { ContactSheet } from "@/components/service/ContactSheet";
import { MapSheetLayout } from "@/components/service/MapSheetLayout";
import { NoActiveRequest } from "@/components/service/NoActiveRequest";
import { SuccessBurst } from "@/components/service/SuccessBurst";
import { useActiveClientRequest, useStatusRoute } from "@/features/service/useClientSimulation";
import { go } from "@/features/navigation";
import { colors, radius } from "@/theme/colors";

const artFor = (vehicleClass: "tow_truck" | "tuk_tuk" | "pickup" | "van" | "truck") =>
  ({ tow_truck: "tow", tuk_tuk: "tuk_tuk", pickup: "pickup", van: "van", truck: "box" } as const)[vehicleClass];

/** 26 · O prestador chegou: confirmar a viatura antes de começar. */
export default function ArrivedScreen() {
  const request = useActiveClientRequest();
  useStatusRoute(request, ["arrived"]);
  const contact = useRef<BottomSheetModal>(null);
  const provider = request?.provider;
  if (!request || !provider) return <NoActiveRequest />;
  const first = provider.name.split(" ")[0];
  return (
    <MapSheetLayout
      mapRatio={0.36}
      map={{ markers: [{ id: "v", kind: "vehicle", coords: request.origin.coords, icon: request.kind === "tow" ? "tow" : "cargo", label: request.origin.area }, { id: "d", kind: "destination", coords: request.destination.coords, label: request.destination.area }], route: { from: request.origin.coords, to: request.destination.coords } }}
      footer={
        <>
          <SecondaryButton label="Contactar prestador" icon={<Phone size={20} color={colors.primary} />} onPress={() => contact.current?.present()} />
          <PrimaryButton label="Confirmar início" onPress={() => go("/trip/pickup")} trailingIcon={<ArrowRight size={22} color={colors.white} />} />
        </>
      }
    >
      <View style={{ marginLeft: -16, marginTop: -8 }}>
        <SuccessBurst size={44} />
      </View>
      <View style={{ gap: 4, marginTop: -8 }} accessibilityLiveRegion="polite">
        <AppText variant="h2" accessibilityRole="header">
          O prestador chegou
        </AppText>
        <AppText variant="body" color={colors.text}>
          <AppText variant="body" weight="bold">
            {provider.name}
          </AppText>{" "}
          está no local de recolha.
        </AppText>
        <AppText variant="caption" color={colors.muted}>
          Confirma se reconheces a viatura.
        </AppText>
      </View>
      <Card padding={0} style={{ overflow: "hidden" }}>
        {provider.vehicle.vehicleClass === "pickup" ? (
          <PhotoTile photo={{ id: "v", asset: "hilux-street", caption: `${provider.vehicle.brand} ${provider.vehicle.model} com matrícula ${provider.vehicle.plate}` }} size="flex" aspect={2.1} rounded={0} />
        ) : (
          <View style={{ alignItems: "center", backgroundColor: colors.primarySoft, paddingVertical: 12 }}>
            <VehicleImage art={artFor(provider.vehicle.vehicleClass)} width={240} height={140} />
          </View>
        )}
        <View style={{ flexDirection: "row", alignItems: "center", padding: 14, gap: 10 }}>
          <View style={{ flex: 1 }}>
            <AppText variant="h3">
              {provider.vehicle.brand} {provider.vehicle.model}
            </AppText>
            <PlateTag plate={provider.vehicle.plate} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.primarySoft, borderRadius: radius.md, padding: 10 }}>
            <ShieldCheck size={22} color={colors.white} fill={colors.accent} />
            <View>
              <AppText variant="tiny" weight="bold">
                Viatura verificada
              </AppText>
              <AppText variant="tiny" color={colors.muted}>
                Corresponde à tua viagem
              </AppText>
            </View>
          </View>
        </View>
      </Card>
      <ContactSheet ref={contact} name={first ?? provider.name} onChat={() => { contact.current?.dismiss(); go("/trip/chat"); }} onCall={() => { contact.current?.dismiss(); go("/trip/call"); }} />
    </MapSheetLayout>
  );
}
