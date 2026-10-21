import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { router } from "expo-router";
import { View } from "react-native";
import { Mail, Phone, UserRound } from "lucide-react-native";
import { AppHeader, Avatar, PrimaryButton, ScreenContainer, TextField } from "@/components/kit";
import { useSessionStore } from "@/stores/useSessionStore";
import { toast } from "@/lib/toast";
import { colors } from "@/theme/colors";

const schema = z.object({
  name: z.string().trim().min(3, "Indica o nome completo.").refine((v) => v.split(/\s+/).length >= 2, "Indica o nome e o apelido."),
  email: z.string().trim().email("Email inválido."),
  phone: z.string().regex(/^\+244 9\d{2} \d{3} \d{3}$/, "Usa o formato +244 923 456 789."),
});
type Form = z.infer<typeof schema>;

/** Editar perfil do cliente. */
export default function EditProfileScreen() {
  const user = useSessionStore((s) => s.user);
  const { control, handleSubmit, formState } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { name: user.name, email: user.email, phone: user.phone } });
  const save = handleSubmit(async (values) => {
    try {
      await useSessionStore.getState().updateProfile(values);
    } catch {
      return toast.error("Não foi possível guardar o perfil");
    }
    toast.success("Perfil actualizado");
    router.back();
  });
  return (
    <ScreenContainer header={<AppHeader title="Editar perfil" />} footer={<PrimaryButton label="Guardar alterações" loading={formState.isSubmitting} disabled={!formState.isDirty} onPress={save} />} gap={16}>
      <View style={{ alignItems: "center", paddingVertical: 8 }}>
        <Avatar name={user.name} initials={user.initials} photo={user.avatar} size={96} verified />
      </View>
      <Controller control={control} name="name" render={({ field, fieldState }) => <TextField label="Nome completo" icon={<UserRound size={20} color={colors.muted} />} value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />} />
      <Controller control={control} name="email" render={({ field, fieldState }) => <TextField label="Email" icon={<Mail size={20} color={colors.muted} />} keyboardType="email-address" autoCapitalize="none" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />} />
      <Controller control={control} name="phone" render={({ field, fieldState }) => <TextField label="Telefone" icon={<Phone size={20} color={colors.muted} />} keyboardType="phone-pad" value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} hint="Vais receber um código para confirmar um número novo (simulado)." />} />
    </ScreenContainer>
  );
}
