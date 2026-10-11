import { create } from "zustand";
import { getService, ServiceId, VehicleId } from "@/domain/catalog";

export type DraftValues = {
  service: ServiceId;
  vehicleType: VehicleId;
  address: string;
  destination: string;
  notes: string;
  cargoDescription: string;
  weightKg: string;
  dimensions: string;
  helpers: boolean;
  pickupAccess: string;
  deliveryAccess: string;
  customerVehicle: string;
  severity: "low" | "medium" | "high";
  evidence: string[];
};
const defaults: DraftValues = {
  service: "tow",
  vehicleType: "tow",
  address: "Rua da Missão, Ingombota",
  destination: "",
  notes: "",
  cargoDescription: "",
  weightKg: "",
  dimensions: "",
  helpers: false,
  pickupAccess: "",
  deliveryAccess: "",
  customerVehicle: "Toyota Corolla · 2015",
  severity: "medium",
  evidence: [],
};
type Draft = DraftValues & {
  update: (values: Partial<DraftValues>) => void;
  chooseService: (id: ServiceId) => void;
  reset: (id?: ServiceId) => void;
};
export const useRequestDraft = create<Draft>((set) => ({
  ...defaults,
  update: (values) => set(values),
  chooseService: (id) =>
    set((state) => {
      const service = getService(id);
      return {
        service: id,
        vehicleType: (service.vehicles as readonly string[]).includes(
          state.vehicleType,
        )
          ? state.vehicleType
          : service.vehicle,
        helpers: service.transport ? state.helpers : false,
      };
    }),
  reset: (id = "tow") =>
    set({
      ...defaults,
      service: id,
      vehicleType: getService(id).vehicle,
      evidence: [],
    }),
}));
export function cargoDetailsValid(
  draft: Pick<
    DraftValues,
    "service" | "cargoDescription" | "weightKg" | "dimensions"
  >,
) {
  if (!getService(draft.service).transport) return true;
  const weight = Number(draft.weightKg.replace(",", "."));
  return (
    draft.cargoDescription.trim().length >= 5 &&
    Number.isFinite(weight) &&
    weight > 0 &&
    draft.dimensions.trim().length >= 3
  );
}
export function requestValid(draft: DraftValues) {
  const service = getService(draft.service);
  return (
    cargoDetailsValid(draft) &&
    draft.address.trim().length >= 5 &&
    (!service.transport || draft.destination.trim().length >= 5) &&
    (service.vehicles as readonly string[]).includes(draft.vehicleType)
  );
}
