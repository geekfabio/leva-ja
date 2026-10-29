import { View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Lock, Mail } from "lucide-react-native";
import { AppHeader, AppText, Divider, PrimaryButton, ScreenContainer, TextButton, TextField, TowTruckIcon } from "@/components/kit";
import { AuthBackdrop } from "@/components/core/AuthBackdrop";
import { loginSchema, type LoginForm } from "@/features/auth/schemas";
import { useSessionStore } from "@/stores/useSessionStore";
import { useProviderStore } from "@/stores/useProviderStore";
import { enterApp, go } from "@/features/navigation";
import { colors } from "@/theme/colors";

/** 06 · Login com email e palavra-passe (validação simulada). */
export default function LoginScreen() {
  const role = useSessionStore((s) => s.role) ?? "client";
  const { control, handleSubmit, formState, setError } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: role === "provider" ? "joao.manuel@angoleva.ao" : "armando@email.com", password: "" },
  });
  const submit = handleSubmit(async ({ email, password }) => {
    try {
      await useSessionStore.getState().login(email, password);
    } catch (error) {
      setError("password", { message: error instanceof Error ? error.message : "Não foi possível entrar." });
      return;
    }
    if (role === "provider") useProviderStore.getState().setOnline(true);
    if (useSessionStore.getState().locationGranted === null) go("/enable-location");
    else enterApp(role);
  });

  return (
    <ScreenContainer header={<AppHeader />} gap={20}>
      <AuthBackdrop />
      <View style={{ gap: 18, marginTop: 8 }}>
        <TowTruckIcon size={76} color={colors.deep} strokeWidth={2.2} />
        <View style={{ gap: 6 }}>
          <AppText variant="display" accessibilityRole="header" style={{ fontSize: 40, lineHeight: 44 }}>
            Bem-vindo{"\n"}de volta
          </AppText>
          <AppText variant="body" style={{ fontSize: 17 }}>
            {role === "provider" ? "Entra para receber pedidos." : "Entra para pedir assistência."}
          </AppText>
        </View>
      </View>
      <Controller
        control={control}
        name="email"
        render={({ field, fieldState }) => (
          <TextField
            label="Email"
            placeholder="Email"
            icon={<Mail size={20} color={colors.muted} />}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <View style={{ gap: 6 }}>
        <Controller
          control={control}
          name="password"
          render={({ field, fieldState }) => (
            <TextField
              label="Palavra-passe"
              placeholder="Palavra-passe"
              icon={<Lock size={20} color={colors.muted} />}
              password
              autoComplete="password"
              textContentType="password"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              onSubmitEditing={submit}
              error={fieldState.error?.message}
            />
          )}
        />
        <View style={{ alignItems: "flex-end" }}>
          <TextButton size="sm" label="Esqueci-me da palavra-passe" onPress={() => go("/recover")} />
        </View>
      </View>
      <PrimaryButton label="Entrar" loading={formState.isSubmitting} onPress={submit} trailingIcon={<ArrowRight size={20} color={colors.white} />} />
      <AppText variant="caption" color={colors.muted} align="center">
        Demonstração: usa qualquer email válido e uma palavra-passe com 6 ou mais caracteres.
      </AppText>
      <Divider />
      <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
        <AppText variant="body">Ainda não tens conta?</AppText>
        <TextButton size="sm" label="Criar conta" onPress={() => go("/register")} />
      </View>
    </ScreenContainer>
  );
}
