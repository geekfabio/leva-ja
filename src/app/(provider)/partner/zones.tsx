import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { BadgeCheck } from "lucide-react-native";
import { AppHeader, AppText, Avatar, Card, ChoiceChip, MapPreview, PrimaryButton, ScreenContainer, SelectionCard, ServiceIcon, VehicleImage } from "@/components/kit";
import { serviceTitle } from "@/features/booking/catalog";
import { useZones } from "@/services/queries";
import { useProviderStore } from "@/stores/useProviderStore";
import type { ServiceKind } from "@/types/domain";
import { toast } from "@/lib/toast";
import { colors, radius } from "@/theme/colors";
import { useMyProvider } from "@/features/provider/useProvider";

const kinds: ServiceKind[] = ["tow", "cargo", "small_move", "house_move"];

/** 44 · Zonas de actuação e serviços aceites. */
export default function ZonesScreen() {
  const me = useMyProvider();
  const vehicle = me.vehicle;
  const [zones, setZones] = useState(useProviderStore.getState().zones);
  const [services, setServices] = useState(useProviderStore.getState().services);
  const [error, setError] = useState<string>();
  const { data: availableZones = [] } = useZones();
  const toggleZone = (id: string) => setZones((z) => (z.includes(id) ? z.filter((x) => x !== id) : [...z, id]));
  const toggleService = (k: ServiceKind) => setServices((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));
  const save = async () => {
    if (!zones.length) return setError("Escolhe pelo menos uma zona.");
    if (!services.length) return setError("Escolhe pelo menos um serviço.");
    setError(undefined);
    if (!(await useProviderStore.getState().saveCoverage(zones, services))) return setError(useProviderStore.getState().lastError ?? "Não foi possível guardar.");
    toast.success({ title: "Alterações guardadas", message: "Vais receber pedidos destas zonas e serviços." });
    router.back();
  };
  return (
    <ScreenContainer header={<AppHeader title="Zonas e serviços" />} footer={<PrimaryButton label="Guardar alterações" onPress={save} />} gap={14}>
      <Card style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Avatar name={me.name} initials={me.initials} photo={me.avatar} size={52} verified />
        <View style={{ flex: 1 }}>
          <AppText variant="title">{me.name}</AppText>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <BadgeCheck size={14} color={colors.white} fill={colors.accent} />
            <AppText variant="caption" color={colors.muted}>
              Prestador verificado
            </AppText>
          </View>
        </View>
        <View style={{ alignItems: "center" }}>
          <VehicleImage art="pickup" width={72} height={44} />
          <AppText variant="tiny" weight="bold">
            {vehicle.plate}
          </AppText>
        </View>
      </Card>
      <View>
        <AppText variant="h2" accessibilityRole="header">
          Áreas de actuação
        </AppText>
        <AppText variant="caption" color={colors.muted}>
          Selecciona as zonas onde prestas os teus serviços.
        </AppText>
      </View>
      <MapPreview height={260} rounded={radius.lg} zones={availableZones.map((z) => ({ id: z.id, coords: z.coords, radiusKm: z.radiusKm, label: z.name, active: zones.includes(z.id) }))} onZonePress={toggleZone} />
      <View accessibilityLabel="Zonas" style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {availableZones.map((z) => (
          <ChoiceChip key={z.id} label={z.name} selected={zones.includes(z.id)} onPress={() => toggleZone(z.id)} />
        ))}
      </View>
      <View>
        <AppText variant="h2" accessibilityRole="header">
          Serviços que aceitas
        </AppText>
        <AppText variant="caption" color={colors.muted}>
          Selecciona os serviços que prestas na plataforma.
        </AppText>
      </View>
      {kinds.map((k) => (
        <SelectionCard key={k} role="checkbox" indicator="check" title={serviceTitle[k]} selected={services.includes(k)} onPress={() => toggleService(k)} media={<ServiceIcon kind={k} size={34} color={colors.ink} strokeWidth={1.6} />} />
      ))}
      {error ? (
        <AppText variant="caption" color={colors.danger} accessibilityRole="alert">
          {error}
        </AppText>
      ) : null}
    </ScreenContainer>
  );
}
