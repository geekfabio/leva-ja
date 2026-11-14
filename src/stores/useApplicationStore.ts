import { create } from "zustand";
import { isRepositoryError, repositories } from "@/data";
import type { ApplicationVehicleInput } from "@/data/repositories/ApplicationsRepository";
import type { ServiceKind } from "@/types/domain";

type Applicant = { name: string; email: string; phone: string };

type ApplicationState = {
  applicant: Applicant | null;
  serviceTypes: ServiceKind[];
  zoneIds: string[];
  vehicle: ApplicationVehicleInput | null;
  submitting: boolean;
  lastError: string | null;
  setApplicant: (applicant: Applicant) => void;
  setCoverage: (serviceTypes: ServiceKind[], zoneIds: string[]) => void;
  setVehicle: (vehicle: ApplicationVehicleInput | null) => void;
  submit: () => Promise<boolean>;
  reset: () => void;
};

const initial = { applicant: null, serviceTypes: [], zoneIds: [], vehicle: null, submitting: false, lastError: null };

/** Rascunho da candidatura a prestador, entre os passos do formulário. */
export const useApplicationStore = create<ApplicationState>((set, get) => ({
  ...initial,
  setApplicant: (applicant) => set({ applicant }),
  setCoverage: (serviceTypes, zoneIds) => set({ serviceTypes, zoneIds }),
  setVehicle: (vehicle) => set({ vehicle }),
  submit: async () => {
    const { applicant, serviceTypes, zoneIds, vehicle } = get();
    if (!applicant) {
      set({ lastError: "Candidatura sem dados pessoais. Preenche o formulário novamente." });
      return false;
    }
    set({ submitting: true, lastError: null });
    try {
      await repositories().applications.submit({ ...applicant, serviceTypes, zoneIds, vehicle });
      set({ submitting: false });
      return true;
    } catch (error) {
      set({ submitting: false, lastError: isRepositoryError(error) ? error.message : "Não foi possível enviar a candidatura." });
      return false;
    }
  },
  reset: () => set(initial),
}));
