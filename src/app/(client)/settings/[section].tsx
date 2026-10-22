import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { AppHeader, AppText, InfoNote, ScreenContainer, SelectionCard, ToggleRow } from "@/components/kit";
import { useAccountStore, type Preferences } from "@/stores/useAccountStore";
import { toast } from "@/lib/toast";
import { go } from "@/features/navigation";
import { colors } from "@/theme/colors";

const titles: Record<string, string> = {
  notifications: "Notificações",
  privacy: "Privacidade e segurança",
  accessibility: "Acessibilidade",
  language: "Idioma",
};

/** Subpáginas das definições, guardadas na store local. */
export default function SettingsSection() {
  const { section = "notifications" } = useLocalSearchParams<{ section: string }>();
  const prefs = useAccountStore((s) => s.preferences);
  const set = useAccountStore((s) => s.setPreferences);
  const toggle = <K extends "notifications" | "accessibility" | "privacy">(group: K, key: keyof Preferences[K]) => (value: boolean) =>
    set((p) => ({ ...p, [group]: { ...p[group], [key]: value } }));

  return (
    <ScreenContainer header={<AppHeader title={titles[section] ?? "Definições"} />} gap={12}>
      {section === "notifications" ? (
        <>
          <ToggleRow title="Actualizações do serviço" description="Prestador a caminho, chegada, entrega e pagamento." value={prefs.notifications.serviceUpdates} onChange={toggle("notifications", "serviceUpdates")} />
          <ToggleRow title="Promoções e novidades" description="Descontos e novos serviços em Luanda." value={prefs.notifications.promotions} onChange={toggle("notifications", "promotions")} />
          <ToggleRow title="Som" description="Tocar um som nas notificações." value={prefs.notifications.sound} onChange={toggle("notifications", "sound")} />
          <InfoNote>As notificações push são simuladas nesta fase.</InfoNote>
        </>
      ) : null}
      {section === "privacy" ? (
        <>
          <ToggleRow title="Partilhar estado da viagem" description="Permite partilhar o link de acompanhamento." value={prefs.privacy.shareTripStatus} onChange={toggle("privacy", "shareTripStatus")} />
          <ToggleRow title="Dados de utilização" description="Ajuda-nos a melhorar a app com estatísticas anónimas." value={prefs.privacy.analytics} onChange={toggle("privacy", "analytics")} />
          <SelectionCard title="Alterar palavra-passe" description="Define uma nova palavra-passe para a tua conta." selected={false} indicator="none" onPress={() => go("/settings/password")} />
          <SelectionCard title="Apagar conta" description="Disponível quando houver backend." selected={false} indicator="none" onPress={() => toast.info("Funcionalidade indisponível nesta fase")} />
        </>
      ) : null}
      {section === "accessibility" ? (
        <>
          <ToggleRow title="Texto maior" description="O tamanho do texto acompanha também as definições do sistema." value={prefs.accessibility.largerText} onChange={toggle("accessibility", "largerText")} />
          <ToggleRow title="Reduzir movimento" description="Diminui animações e transições." value={prefs.accessibility.reduceMotion} onChange={toggle("accessibility", "reduceMotion")} />
          <ToggleRow title="Alto contraste" description="Contornos mais fortes em botões e cartões." value={prefs.accessibility.highContrast} onChange={toggle("accessibility", "highContrast")} />
          <InfoNote>Todos os ecrãs suportam leitores de ecrã (TalkBack e VoiceOver) e áreas de toque de pelo menos 44 pt.</InfoNote>
        </>
      ) : null}
      {section === "language" ? (
        <View accessibilityRole="radiogroup" style={{ gap: 10 }}>
          <SelectionCard title="Português (Portugal)" selected={prefs.language === "pt-PT"} onPress={() => set((p) => ({ ...p, language: "pt-PT" }))} />
          <SelectionCard title="English" description="Em breve" selected={prefs.language === "en"} onPress={() => toast.info("A tradução para inglês chega numa próxima versão")} />
          <AppText variant="caption" color={colors.muted}>
            A aplicação está disponível em português de Portugal.
          </AppText>
        </View>
      ) : null}
    </ScreenContainer>
  );
}
