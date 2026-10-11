import { forwardRef, useState } from "react";
import {
  Text,
  TextInput,
  TextInputProps,
  View,
  useColorScheme,
} from "react-native";
import palette from "@/theme/palette.json";

type Props = TextInputProps & {
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
};

/** Caller layout is preserved; focus, error and disabled states are shared. */
export const AppInput = forwardRef<TextInput, Props>(function AppInput(
  {
    label,
    hint,
    error,
    style,
    onFocus,
    onBlur,
    accessibilityLabel,
    className,
    ...props
  },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const dark = useColorScheme() === "dark";
  const field = (
    <TextInput
      {...props}
      ref={ref}
      className={className}
      accessibilityLabel={accessibilityLabel || label || props.placeholder}
      placeholderTextColor={dark ? "#A8B8AF" : palette.muted}
      selectionColor={palette.greenDark}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      style={[
        {
          minHeight: props.multiline ? 112 : 56,
          borderRadius: 16,
          borderWidth: 1.5,
          borderColor: error
            ? "#B42318"
            : focused
              ? palette.greenDark
              : dark
                ? "#34483D"
                : palette.border,
          backgroundColor: dark ? "#182A21" : "#FFFFFF",
          color: dark ? "#F5F7F6" : palette.ink,
          paddingHorizontal: 16,
          paddingVertical: 14,
          fontSize: 16,
          textAlignVertical: props.multiline ? "top" : "center",
          opacity: props.editable === false ? 0.55 : 1,
        },
        style,
      ]}
    />
  );
  if (!label && !hint && !error) return field;
  return (
    <View style={{ gap: 8 }}>
      {label ? (
        <Text className="text-sm font-semibold text-ink dark:text-white">
          {label}
        </Text>
      ) : null}
      {field}
      {error || hint ? (
        <Text
          accessibilityLiveRegion="polite"
          style={{
            fontSize: 13,
            lineHeight: 20,
            color: error ? "#B42318" : palette.muted,
          }}
        >
          {error || hint}
        </Text>
      ) : null}
    </View>
  );
});
