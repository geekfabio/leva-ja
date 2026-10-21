import { View } from "react-native";
import { Image } from "expo-image";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Mail, Phone, UserRound } from "lucide-react-native";
import { AppHeader, AppText, PrimaryButton, ScreenContainer, StepProgress, TextButton, TextField } from "@/components/kit";
import { registerSchema, type RegisterForm } from "@/features/auth/schemas";
import { illustrations } from "@/mocks/assets";
import { useSessionStore } from "@/stores/useSessionStore";
import { go, swap } from "@/features/navigation";
import { maskPhone } from "@/utils/format";
import { colors } from "@/theme/colors";

function AngolaPrefix() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingRight: 10, borderRightWidth: 1, borderColor: colors.border, height: 32 }}>
      <View accessibilityLabel="Angola" style={{ width: 26, height: 18, borderRadius: 3, overflow: "hidden" }}>
        <View style={{ flex: 1, backgroundColor: "#CC092F" }} />
        <View style={{ flex: 1, backgroundColor: "#000000" }} />
        <View style={{ position: "absolute", left: 10, top: 6, width: 6, height: 6, borderRadius: 3, backgroundColor: "#FFCB00" }} />
      </View>
      <AppText variant="body" weight="semibold">
        +244
      </AppText>
    </View>
  );
}

/** 07 · Criar conta (passo 1 de 2): nome, email e telemóvel. */
export default function RegisterScreen() {
  const pending = useSessionStore((s) => s.pendingRegistration);
  const { control, handleSubmit } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: pending ?? { name: "", email: "", phone: "" },
  });
  const submit = handleSubmit((values) => {
    useSessionStore.getState().startRegistration({ ...values, phone: values.phone.replace(/\s/g, "") });
    go("/register-security");
  });
  return (
    <ScreenContainer header={<AppHeader right={<StepProgress current={1} total={2} labelPosition="top" />} />} padded={false} gap={0}>
      <Image source={illustrations.registerHero} style={{ width: "100%", height: 210 }} contentFit="cover" accessibilityLabel="" />
      <View style={{ paddingHorizontal: 20, gap: 16, marginTop: -8 }}>
        <AppText variant="display" accessibilityRole="header">
          Cria a tua conta
        </AppText>
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <TextField placeholder="Nome completo" accessibilityLabel="Nome completo" icon={<UserRound size={20} color={colors.muted} />} autoComplete="name" textContentType="name" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <TextField placeholder="Email" accessibilityLabel="Email" icon={<Mail size={20} color={colors.muted} />} keyboardType="email-address" autoCapitalize="none" autoComplete="email" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
          )}
        />
        <Controller
          control={control}
          name="phone"
          render={({ field, fieldState }) => (
            <TextField
              placeholder="Telefone"
              accessibilityLabel="Telefone"
              icon={<Phone size={20} color={colors.muted} />}
              prefix={<AngolaPrefix />}
              keyboardType="phone-pad"
              autoComplete="tel"
              value={maskPhone(field.value)}
              onChangeText={(t) => field.onChange(t.replace(/\D/g, "").slice(0, 9))}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
        <PrimaryButton label="Continuar" onPress={submit} trailingIcon={<ArrowRight size={22} color={colors.white} />} />
        <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
          <AppText variant="body">Já tens conta?</AppText>
          <TextButton size="sm" label="Entrar" onPress={() => swap("/login")} />
        </View>
      </View>
    </ScreenContainer>
  );
}
