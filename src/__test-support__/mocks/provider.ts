import type { ProviderDocument, ServiceKind, Zone } from "@/types/domain";
import { daysAgo } from "@/utils/date";
import { places } from "./places";

const in2027 = daysAgo(-300, "00:00");

export const initialDocuments: ProviderDocument[] = [
  { id: "doc-license", title: "Carta de condução", validUntil: in2027, state: "verified", icon: "license" },
  { id: "doc-id", title: "Documento de identificação", validUntil: in2027, state: "verified", icon: "id" },
  { id: "doc-vehicle", title: "Documento da viatura", validUntil: in2027, state: "needs_update", icon: "vehicle" },
  { id: "doc-insurance", title: "Seguro automóvel", validUntil: in2027, state: "verified", icon: "insurance" },
];

export const availableZones: Zone[] = [
  { id: "zone-luanda", name: "Luanda", coords: places.maculusso.coords, radiusKm: 6 },
  { id: "zone-talatona", name: "Talatona", coords: places.talatona.coords, radiusKm: 5 },
  { id: "zone-kilamba", name: "Kilamba", coords: places.kilamba.coords, radiusKm: 4 },
  { id: "zone-viana", name: "Viana", coords: places.viana.coords, radiusKm: 5 },
  { id: "zone-benfica", name: "Benfica", coords: places.benfica.coords, radiusKm: 4 },
];

export const initialZones = ["zone-luanda", "zone-talatona", "zone-kilamba"];
export const initialServices: ServiceKind[] = ["tow", "cargo", "small_move"];
