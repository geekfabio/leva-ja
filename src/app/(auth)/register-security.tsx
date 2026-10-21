import { View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Lock, ShieldCheck } from "lucide-react-native";
import { AppHeader, AppText, Checkbox, IconCircle, InfoNote, PrimaryButton, ScreenContainer, ScreenTitle, StepProgress, TextField } from "@/components/kit";
import { registerSecuritySchema, type RegisterSecurityForm } from "@/features/auth/schemas";
import { useSessionStore } from "@/stores/useSessionStore";
import { Redirect } from "expo-router";
import { go } from "@/features/navigation";
import { colors } from "@/theme/colors";

/** 07 · Criar conta (passo 2 de 2): palavra-passe e termos. */
export default function RegisterSecurityScreen() {
  const pending = useSessionStore((s) => s.pendingRegistration);
  const { control, handleSubmit, formState } = useForm<RegisterSecurityForm>({
    resolver: zodResolver(registerSecuritySchema),
    defaultValues: { password: "", confirm: "", terms: false as unknown as true },
  });
  if (!pending) return <Redirect href={"/register" as never} />;
  const submit = handleSubmit(async () => {
    await new Promise((r) => setTimeout(r, 600));
    go("/verify-email");
  });
  return (
    <ScreenContainer
      header={<AppHeader right={<StepProgress current={2} total={2} labelPosition="top" />} />}
      footer={<PrimaryButton label="Criar conta" loading={formState.isSubmitting} onPress={submit} trailingIcon={<ArrowRight size={22} color={colors.white} />} />}
      gap={18}
    >
      <IconCircle size={72}>
        <ShieldCheck size={36} color={colors.primary} />
      </IconCircle>
      <ScreenTitle title="Protege a tua conta" subtitle={`Olá, ${pending.name.split(" ")[0]}! Define uma palavra-passe para entrares com ${pending.email}.`} />
      <Controller
        control={control}
        name="password"
        render={({ field, fieldState }) => (
          <TextField label="Palavra-passe" placeholder="Mínimo 8 caracteres" icon={<Lock size={20} color={colors.muted} />} password autoComplete="new-password" textContentType="newPassword" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} hint="Usa pelo menos 8 caracteres e um número." />
        )}
      />
      <Controller
        control={control}
        name="confirm"
        render={({ field, fieldState }) => (
          <TextField label="Confirmar palavra-passe" placeholder="Repete a palavra-passe" icon={<Lock size={20} color={colors.muted} />} password value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
        )}
      />
      <Controller
        control={control}
        name="terms"
        render={({ field, fieldState }) => (
          <View style={{ gap: 6 }}>
            <Checkbox tone="plain" checked={!!field.value} onChange={field.onChange} label="Aceito os Termos de Utilização e a Política de Privacidade da Leva Já" />
            {fieldState.error ? (
              <AppText variant="caption" color={colors.danger} accessibilityRole="alert">
                {fieldState.error.message}
              </AppText>
            ) : null}
          </View>
        )}
      />
      <InfoNote>Vamos enviar um código de 6 dígitos para confirmares o email. Na demonstração o código é 123456.</InfoNote>
    </ScreenContainer>
  );
}
