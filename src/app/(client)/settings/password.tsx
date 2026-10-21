import { View } from "react-native";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, ShieldCheck } from "lucide-react-native";
import { AppHeader, IconCircle, InfoNote, PrimaryButton, ScreenContainer, ScreenTitle, TextField } from "@/components/kit";
import { toast } from "@/lib/toast";
import { colors } from "@/theme/colors";

const schema = z
  .object({
    current: z.string().min(6, "Indica a palavra-passe actual."),
    password: z.string().min(8, "Usa pelo menos 8 caracteres.").regex(/\d/, "Inclui pelo menos um número."),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "As palavras-passe não coincidem." })
  .refine((v) => v.password !== v.current, { path: ["password"], message: "Escolhe uma palavra-passe diferente da actual." });
type Form = z.infer<typeof schema>;

/** Alterar palavra-passe (validação local; nenhuma credencial é enviada nesta fase). */
export default function ChangePasswordScreen() {
  const { control, handleSubmit, formState } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { current: "", password: "", confirm: "" } });
  const save = handleSubmit(async () => {
    await new Promise((r) => setTimeout(r, 700));
    toast.success({ title: "Palavra-passe alterada", message: "Usa a nova palavra-passe no próximo início de sessão." });
    router.back();
  });
  const field = (name: keyof Form, label: string, hint?: string) => (
    <Controller
      control={control}
      name={name}
      render={({ field: f, fieldState }) => (
        <TextField label={label} icon={<Lock size={20} color={colors.muted} />} password value={f.value} onChangeText={f.onChange} onBlur={f.onBlur} error={fieldState.error?.message} hint={hint} autoComplete={name === "current" ? "current-password" : "new-password"} />
      )}
    />
  );
  return (
    <ScreenContainer header={<AppHeader title="Alterar palavra-passe" />} footer={<PrimaryButton label="Guardar palavra-passe" loading={formState.isSubmitting} onPress={save} />} gap={16}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <IconCircle size={60}>
          <ShieldCheck size={30} color={colors.primary} />
        </IconCircle>
        <View style={{ flex: 1 }}>
          <ScreenTitle title="Protege a tua conta" size="h2" />
        </View>
      </View>
      {field("current", "Palavra-passe actual")}
      {field("password", "Nova palavra-passe", "Pelo menos 8 caracteres e um número.")}
      {field("confirm", "Confirmar nova palavra-passe")}
      <InfoNote>Demonstração: a alteração é validada localmente e não é guardada.</InfoNote>
    </ScreenContainer>
  );
}
