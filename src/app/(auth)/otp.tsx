import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AuthScaffold } from "@/components/ui/AuthScaffold";
import { AppButton } from "@/components/ui/AppButton";
import { AppInput } from "@/components/ui/AppInput";
import { AppCard } from "@/components/ui/AppCard";

export default function OtpScreen() {
  const { phone, role = "customer" } = useLocalSearchParams<{
    phone?: string;
    role?: string;
  }>();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const login = () => {
    if (code !== "123456") {
      setError("Código incorrecto. Nesta demonstração, usa 123456.");
      return;
    }
    router.replace(
      (role === "provider" ? "/provider" : "/(auth)/location") as never,
    );
  };
  return (
    <AuthScaffold
      title="Confirma o teu número"
      description={`Introduz o código de 6 dígitos para +244 ${phone || "912345678"}.`}
    >
      <AppCard>
        <AppInput
          label="Código de confirmação"
          value={code}
          onChangeText={(value) => {
            setCode(value.replace(/\D/g, ""));
            setError("");
          }}
          maxLength={6}
          autoFocus
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          placeholder="000000"
          error={error}
          hint="Código de demonstração: 123456. Nenhum SMS foi enviado."
          style={{
            fontSize: 28,
            fontWeight: "700",
            letterSpacing: 10,
            textAlign: "center",
          }}
          onSubmitEditing={login}
        />
      </AppCard>
      <View className="mt-6">
        <AppButton
          label="Confirmar e entrar"
          disabled={code.length !== 6}
          onPress={login}
        />
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() =>
          router.replace({ pathname: "/(auth)/phone", params: { role } })
        }
        className="mt-4 min-h-12 items-center justify-center"
      >
        <Text className="text-sm font-semibold text-brand">
          Alterar número de telemóvel
        </Text>
      </Pressable>
    </AuthScaffold>
  );
}
