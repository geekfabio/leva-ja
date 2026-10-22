/** Agrupa milhares com espaço fino, como nas referências: 12 500 Kz. Não depende de Intl (Hermes). */
export function formatNumber(value: number) {
  const sign = value < 0 ? "-" : "";
  const digits = Math.round(Math.abs(value)).toString();
  return sign + digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export const formatKz = (value: number) => `${formatNumber(value)} Kz`;

export const formatSignedKz = (value: number) => `${value > 0 ? "+" : ""}${formatKz(value)}`;

export const formatRating = (value: number) => value.toFixed(1).replace(".", ",");

export const formatKm = (value: number) => `${formatNumber(value)} km`;

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/** Converte "28 500" ou "28500 Kz" num inteiro. */
export const parseAmount = (text: string) => Number(text.replace(/\D/g, "")) || 0;

export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");

export function maskPhone(digits: string) {
  const d = digits.replace(/\D/g, "").slice(0, 9);
  return d.replace(/(\d{3})(\d{0,3})(\d{0,3})/, (_, a, b, c) => [a, b, c].filter(Boolean).join(" "));
}

export const formatFloor = (floor: number) => (floor === 0 ? "Rés-do-chão" : `${floor}.º andar`);
