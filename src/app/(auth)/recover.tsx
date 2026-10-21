import { View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react-native";
import { AppHeader, AppText, IconCircle, PrimaryButton, ScreenContainer, TextButton, TextField } from "@/components/kit";
import { AuthBackdrop } from "@/components/core/AuthBackdrop";
import { recoverSchema } from "@/features/auth/schemas";
import { useSessionStore } from "@/stores/useSessionStore";
import { go } from "@/features/navigation";
import { router } from "expo-router";
import { colors } from "@/theme/colors";

/** 08 · Recuperar acesso por email. */
export default function RecoverScreen() {
  const { control, handleSubmit, formState } = useForm<{ email: string }>({ resolver: zodResolver(recoverSchema), defaultValues: { email: "" } });
  const submit = handleSubmit(async ({ email }) => {
    await useSessionStore.getState().startRecovery(email);
    go("/verify-email");
  });
  return (
    <ScreenContainer header={<AppHeader />} gap={22}>
      <AuthBackdrop />
      <View style={{ alignItems: "center", gap: 14, marginTop: 40 }}>
        <IconCircle size={112}>
          <Lock size={52} color={colors.primary} fill={colors.primary} strokeWidth={1.5} />
        </IconCircle>
        <AppText variant="h1" align="center" accessibilityRole="header">
          Recuperar acesso
        </AppText>
        <AppText variant="body" align="center" style={{ fontSize: 17, maxWidth: 320 }}>
          Indica o teu email e enviaremos um código de recuperação.
        </AppText>
      </View>
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <TextField label="Email" placeholder="Email" keyboardType="email-address" autoCapitalize="none" autoComplete="email" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} onSubmitEditing={submit} error={fieldState.error?.message} />
        )}
      />
      <PrimaryButton label="Enviar código" loading={formState.isSubmitting} onPress={submit} />
      <TextButton label="Voltar ao início de sessão" onPress={() => router.back()} />
    </ScreenContainer>
  );
}
