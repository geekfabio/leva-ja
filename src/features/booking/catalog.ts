import type {
  CargoType,
  IncidentType,
  PropertyType,
  ServiceKind,
  VehicleClass,
  VolumeSize,
  WeightRange,
} from "@/types/domain";

export type BookingStep =
  | "incident"
  | "vehicle"
  | "cargo"
  | "moving"
  | "schedule"
  | "route"
  | "photos"
  | "estimate";

export type ServiceDefinition = {
  kind: ServiceKind;
  /** Variante apresentada no catálogo (ex.: entrega de mercadoria usa o fluxo de carga). */
  variant?: "goods";
  title: string;
  shortTitle: string;
  description: string;
  icon: "tow" | "pickup" | "van" | "house" | "package";
  art: "tow" | "tuk_tuk" | "pickup" | "van" | "box" | "heavy";
};

export const serviceCatalog: ServiceDefinition[] = [
  {
    kind: "tow",
    title: "Reboque de viatura",
    shortTitle: "Reboque",
    description: "Assistência e transporte da tua viatura em Luanda e arredores.",
    icon: "tow",
    art: "tow",
  },
  {
    kind: "cargo",
    title: "Carga com pickup",
    shortTitle: "Carga",
    description: "Transporte de artigos, mobiliário e cargas diversas.",
    icon: "pickup",
    art: "pickup",
  },
  {
    kind: "small_move",
    title: "Mudança pequena",
    shortTitle: "Mudança",
    description: "Ideal para poucos móveis e caixas.",
    icon: "van",
    art: "van",
  },
  {
    kind: "house_move",
    title: "Mudança de casa",
    shortTitle: "Mudança de casa",
    description: "Transporte completo para a tua nova casa.",
    icon: "house",
    art: "box",
  },
  {
    kind: "cargo",
    variant: "goods",
    title: "Entrega de mercadoria",
    shortTitle: "Mercadoria",
    description: "Entregas ágeis por tuk-tuk, pickup ou carrinha em Luanda.",
    icon: "package",
    art: "tuk_tuk",
  },
];

export const serviceTitle: Record<ServiceKind, string> = {
  tow: "Reboque de viatura",
  cargo: "Carga com pickup",
  small_move: "Mudança pequena",
  house_move: "Mudança de casa",
};

export const serviceShortTitle: Record<ServiceKind, string> = {
  tow: "Reboque",
  cargo: "Carga",
  small_move: "Mudança pequena",
  house_move: "Mudança de casa",
};

/** Passos do formulário dinâmico por serviço. A estimativa não conta para "x de y". */
export const bookingSteps: Record<ServiceKind, BookingStep[]> = {
  tow: ["incident", "vehicle", "route", "photos", "estimate"],
  cargo: ["cargo", "route", "photos", "estimate"],
  small_move: ["moving", "schedule", "route", "photos", "estimate"],
  house_move: ["moving", "schedule", "route", "photos", "estimate"],
};

export function stepPosition(kind: ServiceKind, step: BookingStep) {
  const steps = bookingSteps[kind];
  return { current: steps.indexOf(step) + 1, total: steps.length - 1 };
}

export function nextStep(kind: ServiceKind, step: BookingStep): BookingStep {
  const steps = bookingSteps[kind];
  return steps[Math.min(steps.indexOf(step) + 1, steps.length - 1)];
}

export const incidentOptions: { value: IncidentType; label: string; hint: string }[] = [
  { value: "mechanical", label: "Avaria mecânica", hint: "Motor, travões ou caixa" },
  { value: "accident", label: "Acidente", hint: "Colisão ou despiste" },
  { value: "flat_tire", label: "Pneu furado", hint: "Sem pneu suplente" },
  { value: "battery", label: "Bateria descarregada", hint: "A viatura não arranca" },
  { value: "no_fuel", label: "Sem combustível", hint: "Ficou parada na estrada" },
];

export const cargoTypeOptions: { value: CargoType; label: string }[] = [
  { value: "boxes", label: "Caixas e embalagens" },
  { value: "furniture", label: "Móveis" },
  { value: "appliances", label: "Electrodomésticos" },
  { value: "construction", label: "Material de construção" },
  { value: "goods", label: "Mercadoria para entrega" },
  { value: "other", label: "Outro tipo de carga" },
];

export const weightOptions: { value: WeightRange; label: string; boxes: number }[] = [
  { value: "upto100", label: "Até 100 kg", boxes: 1 },
  { value: "101to300", label: "101 – 300 kg", boxes: 2 },
  { value: "301to500", label: "301 – 500 kg", boxes: 3 },
  { value: "over500", label: "Mais de 500 kg", boxes: 4 },
];

export const volumeOptions: { value: VolumeSize; label: string; hint: string }[] = [
  { value: "small", label: "Pequeno", hint: "Até 1 m³" },
  { value: "medium", label: "Médio", hint: "1 a 3 m³" },
  { value: "large", label: "Grande", hint: "Mais de 3 m³" },
];

export const cargoVehicleOptions: { value: Exclude<VehicleClass, "tow_truck" | "tuk_tuk">; label: string; hint: string; art: "pickup" | "van" | "heavy" }[] = [
  { value: "pickup", label: "Pickup", hint: "Até 500 kg", art: "pickup" },
  { value: "van", label: "Carrinha", hint: "Até 1 200 kg", art: "van" },
  { value: "truck", label: "Camião", hint: "Até 3 t", art: "heavy" },
];

/** Opções de pequena logística para a variante «Entrega de mercadoria». */
export const goodsVehicleOptions: { value: "tuk_tuk" | "pickup" | "van"; label: string; hint: string; art: "tuk_tuk" | "pickup" | "van" }[] = [
  { value: "tuk_tuk", label: "Tuk-tuk", hint: "Até 100 kg", art: "tuk_tuk" },
  { value: "pickup", label: "Pickup", hint: "Até 500 kg", art: "pickup" },
  { value: "van", label: "Carrinha", hint: "Até 1 200 kg", art: "van" },
];

export const propertyOptions: { value: PropertyType; label: string }[] = [
  { value: "t0_t1", label: "T0 / T1" },
  { value: "t2", label: "T2" },
  { value: "t3", label: "T3" },
  { value: "t4_plus", label: "T4 ou maior" },
  { value: "office", label: "Escritório" },
];

export const carBrands = ["Toyota", "Hyundai", "Kia", "Nissan", "Mitsubishi", "Suzuki", "Volkswagen", "Outra"];
export const carModels: Record<string, string[]> = {
  Toyota: ["Hilux", "Corolla", "RAV4", "Land Cruiser", "Yaris"],
  Hyundai: ["i10", "Accent", "Tucson", "Creta"],
  Kia: ["Picanto", "Rio", "Sportage"],
  Nissan: ["Navara", "Sunny", "X-Trail"],
  Mitsubishi: ["L200", "Pajero", "ASX"],
  Suzuki: ["Swift", "Vitara", "Jimny"],
  Volkswagen: ["Polo", "Golf", "Amarok"],
  Outra: ["Outro modelo"],
};
export const carColors = ["Branco", "Preto", "Cinzento", "Prata", "Azul", "Vermelho", "Verde", "Outra"];
