import type { ServiceKind, VehicleClass } from "@/types/domain";

export type ApplicationVehicleInput = {
  brand: string;
  model: string;
  plate: string;
  color: string;
  class: VehicleClass;
  categoryLabel: string;
  capacityKg?: number | null;
  year?: number;
};

export type ApplicationInput = {
  name: string;
  email: string;
  phone: string;
  serviceTypes: ServiceKind[];
  zoneIds: string[];
  vehicle?: ApplicationVehicleInput | null;
};

/** Candidatura a prestador, antes de haver conta (POST /applications, público). */
export interface ApplicationsRepository {
  /** Cria a candidatura. Um administrador revê-a no painel; a resposta chega por email. */
  submit(input: ApplicationInput): Promise<{ status: string }>;
}
