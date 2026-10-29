import type { Coordinates, Place } from "@/types/domain";

export type NearbyVehicle = { id: string; coords: Coordinates; kind: "tow" | "cargo" | "move" };

/** Moradas, posição do utilizador e viaturas próximas (GPS e geocodificação simulados). */
export interface LocationRepository {
  /** Posição actual: GPS do dispositivo (se autorizado) com a morada dada pela API; senão, a posição aproximada da API. */
  currentLocation(): Promise<Place>;
  /** Morada (bairro) correspondente a umas coordenadas. */
  reverseGeocode(coords: Coordinates): Promise<Place>;
  search(query: string): Promise<Place[]>;
  /** Lista de bairros para mapas e sugestões. */
  areas(): Promise<Place[]>;
  nearbyVehicles(around: Coordinates): Promise<NearbyVehicle[]>;
  /** Distância estimada por estrada, em km. */
  distanceKm(from: Place, to: Place): number;
}
