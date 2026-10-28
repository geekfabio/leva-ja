import { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, MapPreview, PrimaryButton, TextButton } from "@/components/kit";
import { useQueryClient } from "@tanstack/react-query";
import { deviceLocation } from "@/data";
import { queryKeys, useCurrentLocation } from "@/services/queries";
import { useSessionStore } from "@/stores/useSessionStore";
import { enterApp } from "@/features/navigation";
import { toast } from "@/lib/toast";
import { colors } from "@/theme/colors";

/**
 * 10 · Activar localização. Pede autorização ao sistema (GPS real com a API;
 * na demonstração, um ponto simulado em Luanda) e usa a morada devolvida pela API.
 */
export default function EnableLocationScreen() {
  const [loading, setLoading] = useState(false);
  const { data: here } = useCurrentLocation();
  const queryClient = useQueryClient();
  const finish = (granted: boolean) => {
    const session = useSessionStore.getState();
    session.setLocationGranted(granted);
    if (!granted) toast.info({ title: "Localização desactivada", message: "Vais indicar a morada manualmente em cada pedido." });
    enterApp(session.role ?? "client");
  };
  const allow = async () => {
    setLoading(true);
    const granted = await deviceLocation().requestPermission();
    setLoading(false);
    if (!granted) {
      toast.error({ title: "Sem autorização", message: "Podes activar a localização mais tarde nas definições do telemóvel." });
      finish(false);
      return;
    }
    // A posição passa a vir do GPS: as consultas de localização são refeitas.
    queryClient.invalidateQueries({ queryKey: queryKeys.currentLocation });
    finish(true);
  };
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        <MapPreview height="100%" pulse markers={here ? [{ id: "me", kind: "origin", coords: here.coords, label: here.area }] : []} accessibilityLabel="Mapa de Luanda com a tua posição simulada" />
      </View>
      <SafeAreaView edges={["bottom"]} style={{ backgroundColor: colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -28, paddingHorizontal: 20, paddingTop: 12, gap: 14 }}>
        <View style={{ alignSelf: "center", width: 44, height: 5, borderRadius: 3, backgroundColor: colors.borderStrong }} />
        <AppText variant="h1" align="center" accessibilityRole="header">
          Activa a tua localização
        </AppText>
        <AppText variant="body" align="center" style={{ fontSize: 17 }}>
          Precisamos dela para encontrar ajuda perto de ti e indicar a tua origem.
        </AppText>
        <PrimaryButton label="Permitir localização" loading={loading} onPress={allow} />
        <TextButton label="Agora não" onPress={() => finish(false)} />
      </SafeAreaView>
    </View>
  );
}
