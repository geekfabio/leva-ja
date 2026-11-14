import { View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Mail, Phone, UserRound } from "lucide-react-native";
import { AppHeader, AppText, PrimaryButton, ScreenContainer, TextButton, TextField } from "@/components/kit";
import { applicantSchema, type ApplicantForm } from "@/features/provider/applicationSchemas";
import { useApplicationStore } from "@/stores/useApplicationStore";
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

/** Candidatura a prestador (passo 1 de 3): dados pessoais. */
export default function ApplyScreen() {
  const applicant = useApplicationStore((s) => s.applicant);
  const { control, handleSubmit } = useForm<ApplicantForm>({
    resolver: zodResolver(applicantSchema),
    defaultValues: applicant ?? { name: "", email: "", phone: "" },
  });
  const submit = handleSubmit((values) => {
    useApplicationStore.getState().setApplicant({ ...values, phone: values.phone.replace(/\s/g, "") });
    go("/apply-services");
  });
  return (
    <ScreenContainer header={<AppHeader title="Candidatura" step={{ current: 1, total: 3 }} />} gap={20}>
      <AppText variant="display" accessibilityRole="header">
        Torna-te prestador
      </AppText>
      <AppText variant="body" color={colors.muted}>
        Preenche os teus dados. Um administrador revê a candidatura e envias-te a resposta por email.
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
        <AppText variant="body">Já és prestador?</AppText>
        <TextButton size="sm" label="Entrar" onPress={() => swap("/login")} />
      </View>
    </ScreenContainer>
  );
}
