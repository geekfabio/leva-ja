import { ReactNode } from "react";
import {View, type StyleProp, type ViewStyle} from "react-native";
import { Check } from "lucide-react-native";
import { colors, radius } from "@/theme/colors";
import { AppText } from "./AppText";
import { Appear, ScalePressable } from "./Motion";

type Props = {
  title: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  /** tile: imagem por cima e título por baixo (ref. 05, 13); row: ícone, texto e rádio (ref. 15, 29). */
  layout?: "tile" | "row";
  media?: ReactNode;
  indicator?: "check" | "radio" | "none";
  role?: "radio" | "checkbox";
  style?: StyleProp<ViewStyle>;
  minHeight?: number;
};

export function SelectionCard({
  title,
  description,
  selected,
  onPress,
  layout = "row",
  media,
  indicator = layout === "tile" ? "check" : "radio",
  role = "radio",
  style,
  minHeight,
}: Props) {
  const mark =
    indicator === "none" ? null : indicator === "check" ? (
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          backgroundColor: selected ? colors.accent : "transparent",
          borderWidth: selected ? 0 : 1.5,
          borderColor: colors.borderStrong,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {selected ? (
          <Appear from="pop">
            <Check size={16} color={colors.white} strokeWidth={3} />
          </Appear>
        ) : null}
      </View>
    ) : (
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          borderWidth: 2,
          borderColor: selected ? colors.accent : colors.borderStrong,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {selected ? (
          <Appear from="pop">
            <View style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: colors.accent }} />
          </Appear>
        ) : null}
      </View>
    );

  return (
    <ScalePressable
      accessibilityRole={role}
      accessibilityLabel={description ? `${title}. ${description}` : title}
      accessibilityState={{ checked: selected, selected }}
      onPress={onPress}
      style={({ pressed }) => [
        {
          borderRadius: radius.lg,
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? colors.accent : colors.border,
          backgroundColor: selected ? colors.primarySoft : colors.card,
          padding: layout === "tile" ? 12 : 14,
          minHeight,
          opacity: pressed ? 0.85 : 1,
        },
        layout === "tile"
          ? { alignItems: "center", justifyContent: "center", gap: 10 }
          : { flexDirection: "row", alignItems: "center", gap: 12 },
        style,
      ]}
    >
      {layout === "tile" ? (
        <>
          {mark ? <View style={{ position: "absolute", top: 10, right: 10, zIndex: 1 }}>{mark}</View> : null}
          {media}
          <AppText variant="h3" align="center">
            {title}
          </AppText>
          {description ? (
            <AppText variant="caption" color={colors.muted} align="center">
              {description}
            </AppText>
          ) : null}
        </>
      ) : (
        <>
          {media}
          <View style={{ flex: 1, gap: 2 }}>
            <AppText variant="title">{title}</AppText>
            {description ? (
              <AppText variant="caption" color={colors.muted}>
                {description}
              </AppText>
            ) : null}
          </View>
          {mark}
        </>
      )}
    </ScalePressable>
  );
}

/** Opção compacta tipo "chip" (tipo de imóvel, volume, filtros). */
export function ChoiceChip({ label, selected, onPress, icon }: { label: string; selected: boolean; onPress: () => void; icon?: ReactNode }) {
  return (
    <ScalePressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 44,
        paddingHorizontal: 16,
        borderRadius: radius.pill,
        borderWidth: 1.5,
        borderColor: selected ? colors.accent : colors.border,
        backgroundColor: selected ? colors.primarySoft : colors.card,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      {icon}
      <AppText variant="label" color={selected ? colors.primary : colors.text}>
        {label}
      </AppText>
    </ScalePressable>
  );
}
