import { useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { MapPin, Phone, ShieldAlert, X } from "lucide-react-native";
import { AppText, Card, DangerButton, IconButton, ListRow, StatusBadge, TextButton } from "@/components/kit";
import { emergencyContacts } from "@/mocks/account";
import { userLocation } from "@/mocks/places";
import { useServiceStore } from "@/stores/useServiceStore";
import { serviceTitle } from "@/features/booking/catalog";
import { toast } from "@/lib/toast";
import { colors } from "@/theme/colors";

/** SOS: alerta à equipa de segurança e contactos de emergência (tudo simulado). */
export default function SosScreen() {
  const active = useServiceStore((s) => s.requests.find((r) => r.id === s.activeClientRequestId || r.id === s.activeProviderRequestId));
  const [sent, setSent] = useState(false);
  const alert = useMutation({
    mutationFn: () => new Promise((r) => setTimeout(r, 1200)),
    onSuccess: () => {
      setSent(true);
      toast.success({ title: "Alerta enviado", message: "A equipa de segurança Leva Já vai contactar-te." });
    },
  });
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", justifyContent: "flex-end", paddingHorizontal: 12 }}>
        <IconButton label="Fechar" icon={<X size={24} color={colors.ink} />} onPress={() => router.back()} />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, gap: 14 }}>
        <View style={{ alignItems: "center", gap: 10 }}>
          <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: colors.danger, alignItems: "center", justifyContent: "center", borderWidth: 8, borderColor: colors.dangerSoft }}>
            <AppText variant="h2" weight="extrabold" color={colors.white}>
              SOS
            </AppText>
          </View>
          <AppText variant="h1" align="center" accessibilityRole="header">
            Precisas de ajuda urgente?
          </AppText>
          <AppText variant="body" align="center" color={colors.muted}>
            Enviamos a tua localização e o pedido activo à equipa de segurança.
          </AppText>
        </View>
        <Card style={{ gap: 10 }}>
          <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            <MapPin size={22} color={colors.danger} />
            <AppText variant="body" style={{ flex: 1 }}>
              {userLocation.label} (localização simulada)
            </AppText>
          </View>
          {active ? (
            <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
              <ShieldAlert size={22} color={colors.danger} />
              <AppText variant="body" style={{ flex: 1 }}>
                {serviceTitle[active.kind]} · {active.code}
              </AppText>
            </View>
          ) : null}
          {sent ? <StatusBadge label="Alerta enviado · equipa notificada" tone="success" icon="check" /> : null}
        </Card>
        <DangerButton label={sent ? "Enviar novo alerta" : "Enviar alerta SOS"} loading={alert.isPending} onPress={() => alert.mutate()} />
        <AppText variant="label" color={colors.muted}>
          Contactos de emergência
        </AppText>
        {emergencyContacts.map((c) => (
          <ListRow key={c.id} variant="plain" icon={<Phone size={22} color={colors.danger} />} title={c.label} value={c.number} chevron={false} onPress={() => toast.info({ title: `A ligar para ${c.number}`, message: "Chamada simulada nesta fase." })} />
        ))}
        <TextButton label="Estou bem, fechar" onPress={() => router.back()} />
      </ScrollView>
    </SafeAreaView>
  );
}
