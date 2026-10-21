import { ReactNode, forwardRef, useState } from "react";
import { Pressable, TextInput, View, type TextInputProps } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { colors, radius } from "@/theme/colors";
import { fontFamily } from "@/theme/fonts";
import { AppText } from "./AppText";

export type TextFieldProps = TextInputProps & {
  label?: string;
  icon?: ReactNode;
  /** Elemento à esquerda do texto e depois do ícone (ex.: bandeira +244). */
  prefix?: ReactNode;
  suffix?: ReactNode;
  error?: string;
  hint?: string;
  password?: boolean;
  /** Mostra o contador "0/300" quando há maxLength. */
  counter?: boolean;
  large?: boolean;
};

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, icon, prefix, suffix, error, hint, password, counter, large, multiline, style, value, maxLength, ...props },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const borderColor = error ? colors.danger : focused ? colors.accent : colors.border;
  return (
    <View style={{ gap: 8 }}>
      {label ? <AppText variant="label" weight="bold">{label}</AppText> : null}
      <View
        style={{
          minHeight: multiline ? 112 : large ? 60 : 54,
          borderRadius: radius.md,
          borderWidth: focused || error ? 1.5 : 1,
          borderColor,
          backgroundColor: colors.card,
          flexDirection: "row",
          alignItems: multiline ? "flex-start" : "center",
          paddingHorizontal: 14,
          paddingVertical: multiline ? 12 : 0,
          gap: 10,
        }}
      >
        {icon}
        {prefix}
        <TextInput
          ref={ref}
          accessibilityLabel={label ?? props.placeholder}
          accessibilityHint={error ?? hint}
          placeholderTextColor={colors.subtle}
          secureTextEntry={password ? hidden : undefined}
          multiline={multiline}
          value={value}
          maxLength={maxLength}
          textAlignVertical={multiline ? "top" : "center"}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          style={[
            {
              flex: 1,
              minHeight: multiline ? 88 : 48,
              fontFamily: large ? fontFamily.bold : fontFamily.medium,
              fontSize: large ? 22 : 16,
              color: colors.ink,
              paddingVertical: 0,
            },
            style,
          ]}
          {...props}
        />
        {password ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Mostrar palavra-passe" : "Ocultar palavra-passe"}
            onPress={() => setHidden((v) => !v)}
            hitSlop={10}
          >
            {hidden ? <Eye size={22} color={colors.muted} /> : <EyeOff size={22} color={colors.muted} />}
          </Pressable>
        ) : null}
        {suffix}
      </View>
      {error ? (
        <AppText variant="caption" color={colors.danger} accessibilityLiveRegion="polite" accessibilityRole="alert">
          {error}
        </AppText>
      ) : hint || (counter && maxLength) ? (
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
          <AppText variant="caption" color={colors.muted} style={{ flex: 1 }}>
            {hint ?? ""}
          </AppText>
          {counter && maxLength ? (
            <AppText variant="caption" color={colors.muted}>
              {(value ?? "").length}/{maxLength}
            </AppText>
          ) : null}
        </View>
      ) : null}
    </View>
  );
});
