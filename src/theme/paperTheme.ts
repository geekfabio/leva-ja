import { MD3LightTheme, configureFonts } from "react-native-paper";
import { colors } from "./colors";
import { fontFamily } from "./fonts";

export const paperTheme = {
  ...MD3LightTheme,
  roundness: 4,
  fonts: configureFonts({ config: { fontFamily: fontFamily.medium } }),
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    onPrimary: colors.white,
    primaryContainer: colors.primarySoft,
    onPrimaryContainer: colors.deep,
    secondary: colors.deep,
    secondaryContainer: colors.primaryTint,
    background: colors.background,
    surface: colors.card,
    surfaceVariant: colors.primarySoft,
    outline: colors.border,
    error: colors.danger,
    backdrop: colors.overlay,
  },
};
