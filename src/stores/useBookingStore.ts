import { create } from "zustand";
import type { CargoDetails, MovingDetails, Photo, Place, RoutePlan, ServiceKind, TowDetails } from "@/types/domain";

export type BookingDraft = {
  kind: ServiceKind;
  variant?: "goods";
  tow: Partial<TowDetails>;
  cargo: Partial<CargoDetails>;
  moving: Partial<MovingDetails>;
  origin: Place | null;
  destination: Place | null;
  stops: Place[];
  routePlan: RoutePlan | null;
  photos: Photo[];
  instructions: string;
};

const emptyDraft = (kind: ServiceKind, variant?: "goods"): BookingDraft => ({
  kind,
  variant,
  tow: { incident: "mechanical", canMove: false },
  cargo: {
    cargoType: variant === "goods" ? "goods" : "boxes",
    description: "",
    weight: "upto100",
    volume: "small",
    vehicleClass: "pickup",
    helper: true,
  },
  moving: {
    propertyType: kind === "house_move" ? "t2" : undefined,
    rooms: kind === "house_move" ? 2 : 1,
    items: "",
    helpers: kind === "house_move" ? 2 : 1,
    pickupFloor: 0,
    deliveryFloor: 0,
    elevator: true,
    disassembly: false,
    when: "now",
  },
  // Preenchida com a localização actual (LocationRepository) no passo do trajecto.
  origin: null,
  destination: null,
  stops: [],
  routePlan: null,
  photos: [],
  instructions: "",
});

type BookingState = {
  draft: BookingDraft;
  start: (kind: ServiceKind, variant?: "goods") => void;
  patch: (values: Partial<BookingDraft>) => void;
  patchTow: (values: Partial<TowDetails>) => void;
  patchCargo: (values: Partial<CargoDetails>) => void;
  patchMoving: (values: Partial<MovingDetails>) => void;
  reset: () => void;
};

/** Rascunho do pedido do cliente, mantido entre os passos do formulário dinâmico. */
export const useBookingStore = create<BookingState>((set) => ({
  draft: emptyDraft("cargo"),
  start: (kind, variant) => set({ draft: emptyDraft(kind, variant) }),
  patch: (values) => set((s) => ({ draft: { ...s.draft, ...values } })),
  patchTow: (values) => set((s) => ({ draft: { ...s.draft, tow: { ...s.draft.tow, ...values } } })),
  patchCargo: (values) => set((s) => ({ draft: { ...s.draft, cargo: { ...s.draft.cargo, ...values } } })),
  patchMoving: (values) => set((s) => ({ draft: { ...s.draft, moving: { ...s.draft.moving, ...values } } })),
  reset: () => set((s) => ({ draft: emptyDraft(s.draft.kind) })),
}));
