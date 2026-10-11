import palette from "./palette.json";

export const tokens = {
  light: {
    background: palette.surface,
    card: "#FFFFFF",
    text: palette.ink,
    muted: palette.muted,
    border: palette.border,
    primary: palette.green,
    primarySoft: palette.greenSoft,
    success: palette.greenDark,
    warning: "#D97706",
    info: "#2563EB",
    overlay: "rgba(23, 33, 43, 0.60)",
  },
  dark: {
    background: "#101820",
    card: "#18232E",
    text: "#F8FAFC",
    muted: "#A8B1BD",
    border: "#2A3948",
    primary: "#4ADE80",
    primarySoft: "#173A23",
    success: "#4ADE80",
    warning: "#FBBF24",
    info: "#60A5FA",
    overlay: "rgba(0, 0, 0, 0.68)",
  },
} as const;
