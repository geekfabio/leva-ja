import { useState } from "react";
import { View } from "react-native";
import { MapPin, X } from "lucide-react-native";
import { useQueryClient } from "@tanstack/react-query";
import { AppText } from "@/components/core/AppText";
import { TextButton } from "@/components/core/Buttons";
import { IconButton } from "@/components/core/IconButton";
import { useLocationPermission } from "@/features/location/useLocationPermission";
import { queryKeys } from "@/services/queries";
import { colors, radius } from "@/theme/colors";

/**
 * Aviso discreto (não bloqueia o ecrã) mostrado quando a localização do
 * dispositivo está desligada: é dela que vem a posição do cliente no mapa.
 * Fecha-se com "Agora não" e só volta a aparecer numa próxima abertura da app.
 */
export function LocationPermissionBanner() {
  const { granted, request } = useLocationPermission();
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  if (granted !== false || dismissed) return null;

  const allow = async () => {
    setLoading(true);
    const ok = await request();
    setLoading(false);
    if (!ok) return;
    queryClient.invalidateQueries({ queryKey: queryKeys.currentLocation });
    setDismissed(true);
  };

  return (
    <View
      accessibilityRole="alert"
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: colors.warningSoft,
        borderRadius: radius.md,
        paddingVertical: 10,
        paddingHorizontal: 12,
      }}
    >
      <MapPin size={20} color={colors.warning} />
      <View style={{ flex: 1 }}>
        <AppText variant="label" weight="bold">
          Localização desligada
        </AppText>
        <AppText variant="caption" color={colors.muted}>
          Activa para veres a tua posição e encontrarmos ajuda perto de ti.
        </AppText>
      </View>
      <TextButton label="Activar" onPress={allow} disabled={loading} loading={loading} />
      <IconButton size={32} label="Agora não" icon={<X size={18} color={colors.muted} />} onPress={() => setDismissed(true)} />
    </View>
  );
}
