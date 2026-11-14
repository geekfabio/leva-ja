import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { AppHeader, AppText, ErrorState, PrimaryButton, ScreenContainer } from "@/components/kit";
import { illustrations } from "@/theme/images";
import { useApplicationStore } from "@/stores/useApplicationStore";
import { swap } from "@/features/navigation";
import { colors } from "@/theme/colors";

type Phase = "sending" | "sent" | "error";

/** Candidatura a prestador: envio e confirmação ("a resposta chega por email"). */
export default function ApplySentScreen() {
  const [phase, setPhase] = useState<Phase>("sending");

  const send = useCallback(async () => {
    setPhase("sending");
    const ok = await useApplicationStore.getState().submit();
    setPhase(ok ? "sent" : "error");
  }, []);

  useEffect(() => {
    send();
  }, [send]);

  if (phase === "error") {
    return (
      <ScreenContainer header={<AppHeader title="Candidatura" back={false} />} gap={20}>
        <ErrorState title="Não foi possível enviar" description={useApplicationStore.getState().lastError ?? "Verifica a ligação e tenta novamente."} onRetry={send} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer header={<AppHeader title="Candidatura" back={false} />} gap={20}>
      <Image source={illustrations.emailEnvelope} style={{ width: "100%", height: 220 }} contentFit="contain" accessibilityLabel="" />
      <View style={{ alignItems: "center", gap: 8 }}>
        <AppText variant="h1" align="center" accessibilityRole="header">
          {phase === "sending" ? "A enviar a candidatura…" : "Candidatura enviada"}
        </AppText>
        <AppText variant="body" align="center" color={colors.muted}>
          {phase === "sending"
            ? "Aguarda um momento."
            : "Vais receber uma resposta por email, depois de um administrador rever a tua candidatura."}
        </AppText>
      </View>
      <PrimaryButton
        label="Voltar ao início"
        loading={phase === "sending"}
        disabled={phase === "sending"}
        onPress={() => {
          useApplicationStore.getState().reset();
          swap("/login");
        }}
      />
    </ScreenContainer>
  );
}
