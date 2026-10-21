import { useRef } from "react";
import { View } from "react-native";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Banknote, CreditCard, Landmark, Plus } from "lucide-react-native";
import { AppHeader, AppText, InfoNote, PrimaryButton, ScreenContainer, SecondaryButton, SelectionCard, SheetModal, TextField } from "@/components/kit";
import { useAccountStore } from "@/stores/useAccountStore";
import { toast } from "@/lib/toast";
import { colors } from "@/theme/colors";

const icons = { bank_reference: Landmark, card: CreditCard, cash: Banknote };

const cardSchema = z.object({
  number: z.string().transform((v) => v.replace(/\s/g, "")).pipe(z.string().regex(/^\d{16}$/, "O número tem 16 dígitos.")),
  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Usa o formato MM/AA.")
    .refine((v) => {
      const [m, y] = v.split("/").map(Number);
      return new Date(2000 + y!, m!, 0) >= new Date();
    }, "O cartão está expirado."),
  cvv: z.string().regex(/^\d{3}$/, "3 dígitos."),
});
type CardForm = z.input<typeof cardSchema>;

/** Métodos de pagamento (apenas registo local; nenhum cartão é validado ou cobrado). */
export default function PaymentMethodsScreen() {
  const methods = useAccountStore((s) => s.paymentMethods);
  const sheet = useRef<BottomSheetModal>(null);
  const { control, handleSubmit, reset } = useForm<CardForm>({ resolver: zodResolver(cardSchema), defaultValues: { number: "", expiry: "", cvv: "" } });
  const add = handleSubmit(({ number }) => {
    useAccountStore.getState().addCard(number.slice(-4));
    sheet.current?.dismiss();
    reset();
    toast.success("Cartão adicionado (simulado)");
  });
  return (
    <ScreenContainer header={<AppHeader title="Métodos de pagamento" />} gap={10}>
      <AppText variant="body" color={colors.muted}>
        Escolhe o método predefinido para os teus pedidos.
      </AppText>
      <View accessibilityRole="radiogroup" style={{ gap: 10 }}>
        {methods.map((m) => {
          const Icon = icons[m.kind];
          return <SelectionCard key={m.id} title={m.title} description={m.isDefault ? `${m.detail} · Predefinido` : m.detail} selected={m.isDefault} onPress={() => useAccountStore.getState().setDefaultPayment(m.id)} media={<Icon size={28} color={colors.ink} strokeWidth={1.8} />} />;
        })}
      </View>
      <SecondaryButton label="Adicionar cartão" icon={<Plus size={20} color={colors.primary} />} onPress={() => sheet.current?.present()} />
      <InfoNote>Os pagamentos são simulados nesta fase: nenhum valor é cobrado e os dados do cartão não saem do dispositivo.</InfoNote>
      <SheetModal ref={sheet} title="Novo cartão">
        <Controller control={control} name="number" render={({ field, fieldState }) => <TextField label="Número do cartão" placeholder="0000 0000 0000 0000" keyboardType="number-pad" maxLength={19} value={field.value} onChangeText={(t) => field.onChange(t.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 "))} error={fieldState.error?.message} />} />
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Controller control={control} name="expiry" render={({ field, fieldState }) => <TextField label="Validade" placeholder="MM/AA" keyboardType="number-pad" maxLength={5} value={field.value} onChangeText={(t) => field.onChange(t.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "$1/$2"))} error={fieldState.error?.message} />} />
          </View>
          <View style={{ flex: 1 }}>
            <Controller control={control} name="cvv" render={({ field, fieldState }) => <TextField label="CVV" placeholder="123" keyboardType="number-pad" maxLength={3} password value={field.value} onChangeText={field.onChange} error={fieldState.error?.message} />} />
          </View>
        </View>
        <PrimaryButton label="Guardar cartão" onPress={add} />
      </SheetModal>
    </ScreenContainer>
  );
}
