import { useRef } from "react";
import { Pressable, TextInput, View } from "react-native";
import { colors, radius } from "@/theme/colors";
import { fontFamily } from "@/theme/fonts";
import { AppText } from "./AppText";

/** Seis caixas de código; um único TextInput escondido recebe o texto (melhor para colar e leitores de ecrã). */
export function OtpInput({ value, onChange, length = 6, error }: { value: string; onChange: (v: string) => void; length?: number; error?: string }) {
  const input = useRef<TextInput>(null);
  return (
    <View style={{ gap: 10 }}>
      <Pressable
        accessibilityRole="none"
        onPress={() => input.current?.focus()}
        style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}
      >
        {Array.from({ length }, (_, i) => {
          const char = value[i];
          const active = i === Math.min(value.length, length - 1);
          return (
            <View
              key={i}
              style={{
                flex: 1,
                maxWidth: 56,
                aspectRatio: 0.86,
                borderRadius: radius.md,
                borderWidth: active || error ? 1.5 : 1,
                borderColor: error ? colors.danger : active ? colors.accent : colors.border,
                backgroundColor: colors.card,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AppText variant="h2">{char ?? (active ? "|" : "")}</AppText>
            </View>
          );
        })}
      </Pressable>
      <TextInput
        ref={input}
        value={value}
        onChangeText={(text) => onChange(text.replace(/\D/g, "").slice(0, length))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={length}
        autoFocus
        accessibilityLabel={`Código de ${length} dígitos`}
        accessibilityHint={error}
        style={{ position: "absolute", opacity: 0.02, width: "100%", height: 56, fontFamily: fontFamily.regular }}
      />
      {error ? (
        <AppText variant="caption" color={colors.danger} align="center" accessibilityRole="alert">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}
