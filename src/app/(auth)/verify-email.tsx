import { useEffect, useState } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { AppHeader, AppText, PrimaryButton, ScreenContainer, TextButton } from "@/components/kit";
import { OtpInput } from "@/components/core/OtpInput";
import { DEMO_OTP } from "@/features/auth/schemas";
import { illustrations } from "@/mocks/assets";
import { useSessionStore } from "@/stores/useSessionStore";
import { enterApp, go, swap } from "@/features/navigation";
import { toast } from "@/lib/toast";
import { colors } from "@/theme/colors";

const RESEND_SECONDS = 45;

/** 09 · Confirmar email com código de 6 dígitos (código de demonstração: 123456). */
export default function VerifyEmailScreen() {
  const email = useSessionStore((s) => s.verificationEmail) ?? "o teu email";
  const purpose = useSessionStore((s) => s.verificationPurpose);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [left, setLeft] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const confirm = async () => {
    if (code.length !== 6) return setError("Introduz os 6 dígitos.");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    if (code !== DEMO_OTP) return setError("Código incorrecto. Na demonstração usa 123456.");
    const session = useSessionStore.getState();
    if (purpose === "recover") {
      toast.success({ title: "Acesso recuperado", message: "Já podes entrar com a tua conta." });
      session.login(session.verificationEmail ?? "");
    } else {
      session.confirmEmail();
      toast.success({ title: "Conta criada", message: "Bem-vindo à Leva Já!" });
    }
    if (session.locationGranted === null) swap("/enable-location");
    else enterApp(session.role ?? "client");
  };

  return (
    <ScreenContainer header={<AppHeader />} gap={20}>
      <Image source={illustrations.emailEnvelope} style={{ width: "100%", height: 220 }} contentFit="contain" accessibilityLabel="" />
      <View style={{ alignItems: "center", gap: 8 }}>
        <AppText variant="h1" align="center" accessibilityRole="header">
          Confirma o teu email
        </AppText>
        <AppText variant="body" align="center" color={colors.text} style={{ fontSize: 17 }}>
          Enviámos um código para{"\n"}
          <AppText variant="body" weight="bold" style={{ fontSize: 17 }}>
            {email}
          </AppText>
        </AppText>
      </View>
      <AppText variant="body" align="center" color={colors.muted}>
        Introduz o código de 6 dígitos
      </AppText>
      <OtpInput
        value={code}
        onChange={(v) => {
          setCode(v);
          setError(undefined);
        }}
        error={error}
      />
      <PrimaryButton label="Confirmar" loading={loading} onPress={confirm} />
      {left > 0 ? (
        <AppText variant="body" align="center" color={colors.text} accessibilityLiveRegion="polite">
          Reenviar código em{" "}
          <AppText variant="body" weight="bold" color={colors.primary}>
            00:{String(left).padStart(2, "0")}
          </AppText>
        </AppText>
      ) : (
        <TextButton
          label="Reenviar código"
          onPress={() => {
            setLeft(RESEND_SECONDS);
            toast.info({ title: "Código reenviado", message: "Verifica a tua caixa de correio (simulado)." });
          }}
        />
      )}
      <TextButton size="sm" label="Alterar email" onPress={() => go(purpose === "recover" ? "/recover" : "/register")} />
    </ScreenContainer>
  );
}
