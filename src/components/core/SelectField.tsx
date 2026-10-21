import { ReactNode, useRef } from "react";
import { Pressable, View } from "react-native";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Check, ChevronDown } from "lucide-react-native";
import { colors, radius } from "@/theme/colors";
import { AppText } from "./AppText";
import { SheetModal } from "./SheetModal";

type Option = { value: string; label: string; description?: string };

/** Campo de escolha com lista numa folha inferior (substitui o "dropdown" das referências). */
export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder = "Escolher",
  icon,
  error,
}: {
  label?: string;
  value?: string;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: ReactNode;
  error?: string;
}) {
  const sheet = useRef<BottomSheetModal>(null);
  const selected = options.find((option) => option.value === value);
  return (
    <View style={{ gap: 8 }}>
      {label ? <AppText variant="label" weight="bold">{label}</AppText> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label ?? placeholder}: ${selected?.label ?? "por escolher"}`}
        accessibilityHint="Abre a lista de opções"
        onPress={() => sheet.current?.present()}
        style={({ pressed }) => ({
          minHeight: 54,
          borderRadius: radius.md,
          borderWidth: error ? 1.5 : 1,
          borderColor: error ? colors.danger : colors.border,
          backgroundColor: pressed ? colors.primarySoft : colors.card,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 14,
          gap: 10,
        })}
      >
        {icon}
        <AppText variant="body" weight="medium" color={selected ? colors.ink : colors.subtle} style={{ flex: 1 }} numberOfLines={1}>
          {selected?.label ?? placeholder}
        </AppText>
        <ChevronDown size={20} color={colors.text} />
      </Pressable>
      {error ? (
        <AppText variant="caption" color={colors.danger} accessibilityRole="alert">
          {error}
        </AppText>
      ) : null}
      <SheetModal ref={sheet} title={label ?? placeholder}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              onPress={() => {
                onChange(option.value);
                sheet.current?.dismiss();
              }}
              style={({ pressed }) => ({
                minHeight: 52,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 14,
                borderRadius: radius.md,
                backgroundColor: active ? colors.primarySoft : pressed ? "#F1F4F2" : "transparent",
              })}
            >
              <View style={{ flex: 1 }}>
                <AppText variant="body" weight={active ? "bold" : "medium"}>
                  {option.label}
                </AppText>
                {option.description ? (
                  <AppText variant="caption" color={colors.muted}>
                    {option.description}
                  </AppText>
                ) : null}
              </View>
              {active ? <Check size={20} color={colors.primary} /> : null}
            </Pressable>
          );
        })}
      </SheetModal>
    </View>
  );
}
