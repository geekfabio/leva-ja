import { Pressable, View } from "react-native";
import { Switch } from "react-native-paper";
import { ChevronRight, Radio, WifiOff } from "lucide-react-native";
import { useProviderStore } from "@/stores/useProviderStore";
import { colors } from "@/theme/colors";
import { AppText } from "@/components/core/AppText";
import { toast } from "@/lib/toast";

function toggle() {
  const next = !useProviderStore.getState().online;
  useProviderStore.getState().setOnline(next);
  toast.info(next ? { title: "Estás disponível", message: "Vais receber pedidos próximos." } : { title: "Estás indisponível", message: "Não vais receber novos pedidos." });
}

/** Interruptor de disponibilidade, pílula ou estado destacado sobre o mapa. */
export function AvailabilityToggle({ variant = "switch" }: { variant?: "switch" | "pill" | "status" }) {
  const online = useProviderStore((s) => s.online);
  if (variant === "status")
    return (
      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: online }}
        accessibilityLabel={online ? "Online, a receber pedidos" : "Offline, não estás a receber pedidos"}
        accessibilityHint="Alterna a disponibilidade"
        onPress={toggle}
        style={({ pressed }) => ({
          maxWidth: online ? 126 : 238,
          minHeight: online ? 44 : 64,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingHorizontal: online ? 13 : 14,
          paddingVertical: online ? 8 : 10,
          borderRadius: online ? 999 : 16,
          borderWidth: 1.5,
          borderColor: online ? colors.accent : "#F04438",
          backgroundColor: online ? "rgba(255,255,255,0.96)" : "#FFF4F2",
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <View style={{ width: online ? 28 : 36, height: online ? 28 : 36, borderRadius: 18, backgroundColor: online ? colors.primarySoft : "#FEE4E2", alignItems: "center", justifyContent: "center" }}>
          {online ? <Radio size={17} color={colors.accent} /> : <WifiOff size={20} color="#D92D20" />}
        </View>
        <View style={{ flexShrink: 1 }}>
          <AppText variant="label" weight="extrabold" color={online ? colors.primary : "#B42318"}>
            {online ? "Online" : "Estás offline"}
          </AppText>
          {!online ? (
            <AppText variant="tiny" color="#B42318" numberOfLines={1}>
              Toca para receber pedidos
            </AppText>
          ) : null}
        </View>
      </Pressable>
    );
  if (variant === "pill")
    return (
      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: online }}
        accessibilityLabel={online ? "Disponível" : "Indisponível"}
        accessibilityHint="Alterna a disponibilidade para novos pedidos"
        onPress={toggle}
        style={{ flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: online ? colors.card : "#FFF4F2", borderColor: online ? colors.border : "#F04438", borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, minHeight: 44 }}
      >
        {online ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent }} /> : <WifiOff size={17} color="#D92D20" />}
        <AppText variant="label" weight="bold" color={online ? colors.ink : "#B42318"}>
          {online ? "Disponível" : "Indisponível"}
        </AppText>
        <ChevronRight size={14} color={colors.ink} />
      </Pressable>
    );
  return (
    <Pressable accessibilityRole="switch" accessibilityState={{ checked: online }} accessibilityLabel={online ? "Online" : "Offline"} onPress={toggle} style={{ alignItems: "center", gap: 2 }}>
      <View pointerEvents="none">
        <Switch value={online} color={colors.accent} />
      </View>
      <AppText variant="tiny" weight="bold" color={online ? colors.primary : colors.muted}>
        {online ? "Online" : "Offline"}
      </AppText>
    </Pressable>
  );
}
