import { useState } from "react";
import { View } from "react-native";
import { Accessibility, Bell, Globe, LogOut, MapPin, RotateCcw, ShieldCheck, Wifi, Zap } from "lucide-react-native";
import { Switch } from "react-native-paper";
import { AppHeader, AppText, Avatar, Card, ConfirmDialog, Divider, ListGroup, ListRow, ScreenContainer } from "@/components/kit";
import { useAccountStore } from "@/stores/useAccountStore";
import { dataSource, resetMockDatabase } from "@/data";
import { useSessionStore } from "@/stores/useSessionStore";
import { useServiceStore } from "@/stores/useServiceStore";
import { useProviderStore } from "@/stores/useProviderStore";
import { go, swap } from "@/features/navigation";
import { toast } from "@/lib/toast";
import { colors } from "@/theme/colors";

function SwitchRow({ title, subtitle, icon, value, onChange }: { title: string; subtitle?: string; icon: React.ReactNode; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <ListRow
      variant="plain"
      icon={icon}
      title={title}
      subtitle={subtitle}
      onPress={() => onChange(!value)}
      chevron={false}
      accessibilityHint={value ? "Activo. Toca para desactivar" : "Inactivo. Toca para activar"}
      right={
        <View pointerEvents="none">
          <Switch value={value} color={colors.accent} />
        </View>
      }
    />
  );
}

/** 32 · Definições: notificações, privacidade, localização, acessibilidade, idioma e sessão. */
export default function SettingsScreen() {
  const user = useSessionStore((s) => s.user);
  const role = useSessionStore((s) => s.role);
  const prefs = useAccountStore((s) => s.preferences);
  const setPrefs = useAccountStore((s) => s.setPreferences);
  const [logout, setLogout] = useState(false);
  const [reset, setReset] = useState(false);
  const icon = { size: 24, color: colors.ink };
  return (
    <ScreenContainer header={<AppHeader title="Definições" />} gap={14}>
      <Card tone="soft" onPress={() => go("/edit-profile")} accessibilityLabel={`${user.name}, editar perfil`} style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <Avatar name={user.name} initials={user.initials} size={60} />
        <View style={{ flex: 1 }}>
          <AppText variant="title">{user.name}</AppText>
          <AppText variant="caption" color={colors.muted}>
            {user.phone}
          </AppText>
        </View>
      </Card>
      <ListGroup>
        <ListRow variant="plain" icon={<Bell {...icon} />} title="Notificações" onPress={() => go("/settings/notifications")} />
        <Divider inset={54} />
        <ListRow variant="plain" icon={<ShieldCheck {...icon} />} title="Privacidade e segurança" onPress={() => go("/settings/privacy")} />
        <Divider inset={54} />
        <SwitchRow icon={<MapPin {...icon} />} title="Localização" subtitle={prefs.locationSharing ? "Posição simulada em Luanda" : "Indicas a morada manualmente"} value={prefs.locationSharing} onChange={(v) => setPrefs((p) => ({ ...p, locationSharing: v }))} />
        <Divider inset={54} />
        <ListRow variant="plain" icon={<Accessibility {...icon} />} title="Acessibilidade" onPress={() => go("/settings/accessibility")} />
        <Divider inset={54} />
        <ListRow variant="plain" icon={<Globe {...icon} />} title="Idioma" value={prefs.language === "pt-PT" ? "Português" : "English"} onPress={() => go("/settings/language")} />
      </ListGroup>
      <AppText variant="label" color={colors.muted} style={{ marginTop: 6 }}>
        Demonstração
      </AppText>
      <ListGroup>
        <SwitchRow icon={<Zap {...icon} />} title="Avanço automático do serviço" subtitle="Desliga para conduzir o pedido pela área do prestador" value={prefs.autoAdvance} onChange={(v) => setPrefs((p) => ({ ...p, autoAdvance: v }))} />
        <Divider inset={54} />
        <SwitchRow icon={<Wifi {...icon} />} title="Simular falhas de rede" subtitle="Mostra os estados de erro das listas" value={prefs.simulateNetworkErrors} onChange={(v) => setPrefs((p) => ({ ...p, simulateNetworkErrors: v }))} />
        <Divider inset={54} />
        {dataSource === "mock" ? <ListRow variant="plain" icon={<RotateCcw {...icon} />} title="Repor dados de demonstração" onPress={() => setReset(true)} /> : null}
      </ListGroup>
      <ListRow tone="danger" icon={<LogOut size={24} color={colors.danger} />} title="Terminar sessão" chevron={false} onPress={() => setLogout(true)} />
      <AppText variant="tiny" color={colors.subtle} align="center">
        Leva Já 0.2.0 · {role === "provider" ? "Área do prestador" : "Área do cliente"} · dados mockados
      </AppText>
      <ConfirmDialog
        visible={logout}
        title="Terminar sessão?"
        message="Vais voltar ao ecrã de escolha de perfil."
        confirmLabel="Terminar sessão"
        destructive
        onCancel={() => setLogout(false)}
        onConfirm={() => {
          setLogout(false);
          useSessionStore.getState().logout();
          swap("/profile-select");
        }}
      />
      <ConfirmDialog
        visible={reset}
        title="Repor dados?"
        message="Os pedidos, ganhos e documentos voltam ao estado inicial da demonstração."
        confirmLabel="Repor"
        onCancel={() => setReset(false)}
        onConfirm={() => {
          setReset(false);
          // Repõe a base de dados mock e volta a carregar as stores a partir dos repositórios.
          resetMockDatabase();
          useServiceStore.getState().hydrate();
          const providerId = useSessionStore.getState().providerId;
          if (providerId) useProviderStore.getState().hydrate(providerId);
          useAccountStore.getState().hydrate(useSessionStore.getState().user.id);
          toast.success("Dados de demonstração repostos");
        }}
      />
    </ScreenContainer>
  );
}
