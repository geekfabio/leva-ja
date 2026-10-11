import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ShieldCheck } from "lucide-react-native";
import { AuthScaffold } from "@/components/ui/AuthScaffold";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppCard } from "@/components/ui/AppCard";

export default function PhoneScreen() {
  const { role = "customer" } = useLocalSearchParams<{ role?: string }>();
  const provider = role === "provider";
  const [phone, setPhone] = useState(provider ? "923456789" : "912345678");
  const [touched, setTouched] = useState(false);
  const valid = /^9\d{8}$/.test(phone);
  const next = () => {
    if (valid)
      router.push({ pathname: "/(auth)/otp", params: { phone, role } });
  };
  return (
    <AuthScaffold
      title={provider ? "Vamos trabalhar juntos." : "A tua ajuda começa aqui."}
      description={
        provider
          ? "Entra na tua conta de parceiro para gerir os teus serviços e ganhos."
          : "Introduz o teu número para pedir transporte, mudanças ou assistência."
      }
      footer={
        <View className="flex-row items-center justify-center gap-2">
          <ShieldCheck size={16} color="#087F4F" />
          <Text className="text-xs text-muted">
            O teu número identifica a tua conta.
          </Text>
        </View>
      }
    >
      <AppCard>
        <Text className="mb-3 text-sm font-semibold text-ink dark:text-white">
          Número de telemóvel
        </Text>
        <View className="flex-row items-center gap-3">
          <View className="h-14 justify-center rounded-2xl bg-surface px-4">
            <Text className="font-semibold text-ink">AO +244</Text>
          </View>
          <AppInput
            accessibilityLabel="Número de telemóvel"
            value={phone}
            onChangeText={(value) => setPhone(value.replace(/\D/g, ""))}
            onBlur={() => setTouched(true)}
            maxLength={9}
            placeholder="912 345 678"
            keyboardType="phone-pad"
            autoComplete="tel-national"
            textContentType="telephoneNumber"
            returnKeyType="done"
            onSubmitEditing={next}
            className="flex-1"
          />
        </View>
        {touched && !valid ? (
          <Text
            accessibilityLiveRegion="polite"
            className="mt-2 text-sm text-red-700"
          >
            Introduz 9 dígitos, começando por 9.
          </Text>
        ) : null}
        <Text className="mt-4 text-sm leading-5 text-muted">
          Vais confirmar o número com um código de 6 dígitos.
        </Text>
      </AppCard>
      <View className="mt-6">
        <AppButton label="Continuar" disabled={!valid} onPress={next} />
      </View>
      <View className="mt-5 rounded-2xl bg-brand-soft p-4">
        <Text className="text-xs font-semibold text-brand">
          MODO DEMONSTRAÇÃO
        </Text>
        <Text className="mt-1 text-sm leading-5 text-ink">
          Número de exemplo preenchido. Usa o código 123456. Não enviamos SMS.
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() =>
          router.replace(
            (provider ? "/(auth)/phone" : "/provider/login") as never,
          )
        }
        className="mt-5 min-h-12 items-center justify-center"
      >
        <Text className="text-sm font-semibold text-brand">
          {provider ? "Entrar como cliente" : "Sou parceiro Leva Já"}
        </Text>
      </Pressable>
    </AuthScaffold>
  );
}
