import { Text, type TextProps, type TextStyle } from "react-native";
import { colors } from "@/theme/colors";
import { fontFamily, type FontWeight } from "@/theme/fonts";

const variants = {
  display: { fontSize: 34, lineHeight: 40, weight: "extrabold", letterSpacing: -0.6 },
  h1: { fontSize: 28, lineHeight: 34, weight: "extrabold", letterSpacing: -0.4 },
  h2: { fontSize: 22, lineHeight: 28, weight: "bold", letterSpacing: -0.2 },
  h3: { fontSize: 18, lineHeight: 24, weight: "bold", letterSpacing: 0 },
  title: { fontSize: 16, lineHeight: 22, weight: "bold", letterSpacing: 0 },
  body: { fontSize: 15, lineHeight: 22, weight: "regular", letterSpacing: 0 },
  label: { fontSize: 14, lineHeight: 20, weight: "semibold", letterSpacing: 0 },
  caption: { fontSize: 13, lineHeight: 18, weight: "regular", letterSpacing: 0 },
  tiny: { fontSize: 11, lineHeight: 14, weight: "medium", letterSpacing: 0.2 },
} satisfies Record<string, { fontSize: number; lineHeight: number; weight: FontWeight; letterSpacing: number }>;

export type TextVariant = keyof typeof variants;

export type AppTextProps = TextProps & {
  variant?: TextVariant;
  weight?: FontWeight;
  color?: string;
  align?: TextStyle["textAlign"];
  className?: string;
};

/** Texto da aplicação: aplica a família Plus Jakarta Sans pelo peso, nunca por fontWeight. */
export function AppText({
  variant = "body",
  weight,
  color = colors.ink,
  align,
  style,
  ...props
}: AppTextProps) {
  const v = variants[variant];
  return (
    <Text
      maxFontSizeMultiplier={1.6}
      {...props}
      style={[
        {
          fontFamily: fontFamily[weight ?? v.weight],
          fontSize: v.fontSize,
          lineHeight: v.lineHeight,
          letterSpacing: v.letterSpacing,
          color,
          textAlign: align,
        },
        style,
      ]}
    />
  );
}
