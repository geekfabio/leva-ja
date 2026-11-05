import { useState } from "react";
import { View } from "react-native";
import { ArrowRight } from "lucide-react-native";
import { AppHeader, AppText, ChoiceChip, PrimaryButton, ScreenContainer, SelectionCard, ServiceIcon } from "@/components/kit";
import { serviceTitle } from "@/features/booking/catalog";
import { useZones } from "@/services/queries";
import { useApplicationStore } from "@/stores/useApplicationStore";
import { go } from "@/features/navigation";
import type { ServiceKind } from "@/types/domain";
import { colors } from "@/theme/colors";

const kinds: ServiceKind[] = ["tow", "cargo", "small_move", "house_move"];

/** Candidatura a prestador (passo 2 de 3): serviços e zonas. */
export default function ApplyServicesScreen() {
  const [serviceTypes, setServiceTypes] = useState<ServiceKind[]>(useApplicationStore.getState().serviceTypes);
  const [zoneIds, setZoneIds] = useState<string[]>(useApplicationStore.getState().zoneIds);
  const [error, setError] = useState<string>();
  const { data: zones = [] } = useZones();

  const toggleService = (kind: ServiceKind) => setServiceTypes((current) => (current.includes(kind) ? current.filter((k) => k !== kind) : [...current, kind]));
  const toggleZone = (id: string) => setZoneIds((current) => (current.includes(id) ? current.filter((z) => z !== id) : [...current, id]));

  const submit = () => {
    if (!serviceTypes.length) return setError("Escolhe pelo menos um serviço.");
    if (!zoneIds.length) return setError("Escolhe pelo menos uma zona.");
    setError(undefined);
    useApplicationStore.getState().setCoverage(serviceTypes, zoneIds);
    go("/apply-vehicle");
  };

  return (
    <ScreenContainer header={<AppHeader title="Candidatura" step={{ current: 2, total: 3 }} />} footer={<PrimaryButton label="Continuar" onPress={submit} trailingIcon={<ArrowRight size={22} color={colors.white} />} />} gap={16}>
      <View>
        <AppText variant="h2" accessibilityRole="header">
          Que serviços prestas?
        </AppText>
        <AppText variant="caption" color={colors.muted}>
          Escolhe os serviços que queres prestar na plataforma.
        </AppText>
      </View>
      {kinds.map((kind) => (
        <SelectionCard key={kind} role="checkbox" indicator="check" title={serviceTitle[kind]} selected={serviceTypes.includes(kind)} onPress={() => toggleService(kind)} media={<ServiceIcon kind={kind} size={34} color={colors.ink} strokeWidth={1.6} />} />
      ))}
      <View>
        <AppText variant="h2" accessibilityRole="header">
          Em que zonas actuas?
        </AppText>
        <AppText variant="caption" color={colors.muted}>
          Escolhe as zonas de Luanda onde podes prestar serviço.
        </AppText>
      </View>
      <View accessibilityLabel="Zonas" style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {zones.map((zone) => (
          <ChoiceChip key={zone.id} label={zone.name} selected={zoneIds.includes(zone.id)} onPress={() => toggleZone(zone.id)} />
        ))}
      </View>
      {error ? (
        <AppText variant="caption" color={colors.danger} accessibilityRole="alert">
          {error}
        </AppText>
      ) : null}
    </ScreenContainer>
  );
}
