import { Pressable, View } from "react-native";
import { Switch } from "react-native-paper";
import { ChevronRight } from "lucide-react-native";
import { useProviderStore } from "@/stores/useProviderStore";
import { colors } from "@/theme/colors";
import { AppText } from "@/components/core/AppText";
import { toast } from "@/lib/toast";

function toggle() {
  const next = !useProviderStore.getState().online;
  useProviderStore.getState().setOnline(next);
  toast.info(next ? { title: "Estás disponível", message: "Vais receber pedidos próximos." } : { title: "Estás indisponível", message: "Não vais receber novos pedidos." });
}

/** Interruptor de disponibilidade (ref. 34) ou pílula "Disponível ›" (ref. 37). */
export function AvailabilityToggle({ variant = "switch" }: { variant?: "switch" | "pill" }) {
  const online = useProviderStore((s) => s.online);
  if (variant === "pill")
    return (
      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: online }}
        accessibilityLabel={online ? "Disponível" : "Indisponível"}
        accessibilityHint="Alterna a disponibilidade para novos pedidos"
        onPress={toggle}
        style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.card, borderRadius: 999, paddingHorizontal: 10, minHeight: 44 }}
      >
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: online ? colors.accent : colors.subtle }} />
        <AppText variant="label" weight="bold">
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
