import type { Place } from "@/types/domain";

const place = (
  id: string,
  area: string,
  latitude: number,
  longitude: number,
  label = `${area}, Luanda`,
): Place => ({ id, label, area, city: "Luanda", coords: { latitude, longitude } });

/** Coordenadas aproximadas de bairros de Luanda, apenas para o mapa simulado. */
export const places = {
  ingombota: place("ingombota", "Ingombota", -8.8147, 13.2302),
  talatona: place("talatona", "Talatona", -8.918, 13.183),
  maianga: place("maianga", "Maianga", -8.827, 13.237),
  kilamba: place("kilamba", "Kilamba", -8.996, 13.27),
  benfica: place("benfica", "Benfica", -8.95, 13.16),
  sambizanga: place("sambizanga", "Sambizanga", -8.8, 13.25),
  viana: place("viana", "Viana", -8.903, 13.374),
  miramar: place("miramar", "Miramar", -8.808, 13.226),
  samba: place("samba", "Samba", -8.85, 13.208),
  camama: place("camama", "Camama", -8.934, 13.247),
  rangel: place("rangel", "Rangel", -8.83, 13.262),
  maculusso: place("maculusso", "Maculusso", -8.819, 13.238),
  alvalade: place("alvalade", "Alvalade", -8.835, 13.241),
  valodia: place(
    "valodia",
    "Maianga",
    -8.834,
    13.258,
    "Avenida Comandante Valódia",
  ),
  missao: place("missao", "Sambizanga", -8.806, 13.246, "Rua da Missão"),
} satisfies Record<string, Place>;

export const placeList: Place[] = Object.values(places);

/** Centro de Luanda usado como posição simulada do utilizador. */
export const userLocation = places.ingombota;

// Cálculos geográficos puros vivem em utils/geo; reexportados por compatibilidade.
export { estimateMinutes, roadDistanceKm } from "@/utils/geo";
