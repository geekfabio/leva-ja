import type { Coordinates } from "@/types/domain";

export type MapMarker = {
  id: string;
  coords: Coordinates;
  kind: "origin" | "destination" | "vehicle" | "user" | "request" | "stop";
  label?: string;
  /** Texto curto num balão (ex.: "2 km", "Chega em 8 min"). */
  bubble?: string;
  icon?: "tow" | "cargo" | "move";
};

export type MapZone = { id: string; coords: Coordinates; radiusKm: number; label: string; active: boolean };

export type MapPreviewProps = {
  height?: number | `${number}%`;
  markers?: MapMarker[];
  /** Desenha o trajecto entre estes dois pontos. `coordinates` vem do serviço de routing quando disponível. */
  route?: { from: Coordinates; to: Coordinates; coordinates?: Coordinates[] };
  zones?: MapZone[];
  /** Pulsação de procura à volta do primeiro marcador de origem. */
  pulse?: boolean;
  rounded?: number;
  /** Sem interacção (pré-visualizações em cartões). */
  static?: boolean;
  accessibilityLabel?: string;
  onZonePress?: (id: string) => void;
  /** Coordenada tocada pelo utilizador num mapa interactivo. */
  onMapPress?: (coords: Coordinates) => void;
  /** Mostra o ponto azul de GPS no dispositivo quando a permissão foi concedida. */
  showsUserLocation?: boolean;
};
