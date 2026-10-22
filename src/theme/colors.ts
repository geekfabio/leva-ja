/**
 * Paleta da nova experiência Leva Já (referências 01–46).
 * `primary` é o verde de acções com texto branco (contraste AA 4,6:1);
 * `accent` é o verde vivo das referências, usado em elementos sem texto
 * (rotas no mapa, progresso, interruptores, ícones).
 */
export const colors = {
  primary: "#0A8743",
  primaryPressed: "#08743A",
  accent: "#12A150",
  primarySoft: "#E8F6EE",
  primaryTint: "#D3EFDF",
  deep: "#0B4A2C",
  deeper: "#053420",
  ink: "#0F2A1E",
  text: "#1C2B24",
  muted: "#5B6B63",
  subtle: "#8A9790",
  background: "#F8F9F7",
  card: "#FFFFFF",
  border: "#E3E9E5",
  borderStrong: "#C9D4CE",
  danger: "#D92D20",
  dangerSoft: "#FDECEA",
  warning: "#B45309",
  warningBright: "#F59E0B",
  warningSoft: "#FFF4DD",
  info: "#2457A8",
  infoSoft: "#EAF1FF",
  star: "#F5B000",
  mapLand: "#EEF1EC",
  mapWater: "#BFDDF0",
  mapRoad: "#FFFFFF",
  mapPark: "#D7EDD9",
  overlay: "rgba(5, 25, 15, 0.55)",
  white: "#FFFFFF",
} as const;

export const radius = { sm: 10, md: 14, lg: 18, xl: 24, pill: 999 } as const;
export const spacing = { gutter: 20, section: 24 } as const;

export const shadow = {
  card: {
    shadowColor: "#0F2A1E",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  floating: {
    shadowColor: "#0F2A1E",
    shadowOpacity: 0.14,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
} as const;
