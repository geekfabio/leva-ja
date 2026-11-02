import type {
  CargoDetails,
  MovingDetails,
  PriceBreakdown,
  ServiceKind,
  TowDetails,
  VehicleClass,
} from "@/types/domain";

export const PLATFORM_FEE = 500;
/** Comissão da plataforma aplicada ao valor do serviço para obter o ganho do prestador. */
export const PROVIDER_COMMISSION = 0.15;

const base: Record<ServiceKind, number> = {
  tow: 8000,
  cargo: 5500,
  small_move: 9000,
  house_move: 18000,
};
const perKm: Record<ServiceKind, number> = {
  tow: 250,
  cargo: 250,
  small_move: 300,
  house_move: 400,
};

const roundTo500 = (value: number) => Math.round(value / 500) * 500;

export type PricingInput = {
  kind: ServiceKind;
  distanceKm: number;
  tow?: Partial<TowDetails>;
  cargo?: Partial<CargoDetails>;
  moving?: Partial<MovingDetails>;
};

export function extrasFor(input: PricingInput) {
  let extras = 0;
  const { tow, cargo, moving } = input;
  if (input.kind === "tow" && tow) {
    if (tow.canMove === false) extras += 1500;
    if (tow.incident === "accident") extras += 2000;
  }
  if (input.kind === "cargo" && cargo) {
    extras += { upto100: 0, "101to300": 1500, "301to500": 3000, over500: 6000 }[cargo.weight ?? "upto100"];
    extras += { small: 0, medium: 1000, large: 2500 }[cargo.volume ?? "small"];
    extras += { tuk_tuk: -1000, pickup: 0, tow_truck: 0, van: 2000, truck: 6000 }[cargo.vehicleClass ?? "pickup"];
    if (cargo.helper) extras += 2000;
  }
  if ((input.kind === "small_move" || input.kind === "house_move") && moving) {
    if (input.kind === "house_move") extras += Math.max(0, (moving.rooms ?? 1) - 1) * 2000;
    extras += (moving.helpers ?? 0) * 2500;
    if (!moving.elevator) extras += ((moving.pickupFloor ?? 0) + (moving.deliveryFloor ?? 0)) * 500;
    if (moving.disassembly) extras += 5000;
  }
  return extras;
}

export function estimatePrice(input: PricingInput): PriceBreakdown {
  const distance = roundTo500(input.distanceKm * perKm[input.kind]);
  const extras = extrasFor(input);
  const service = roundTo500(base[input.kind] + distance + extras);
  return {
    base: base[input.kind],
    distance,
    extras: service - base[input.kind] - distance,
    platformFee: PLATFORM_FEE,
    total: service + PLATFORM_FEE,
  };
}

export function providerEarningFor(price: PriceBreakdown) {
  const service = price.total - price.platformFee;
  return Math.floor((service * (1 - PROVIDER_COMMISSION)) / 500) * 500;
}

/** Serviços cujo preço final é proposto pelo prestador. */
export const needsProposal = (kind: ServiceKind) => kind === "house_move";

export type VehicleRecommendation = {
  vehicleClass: VehicleClass;
  art: "tow" | "tuk_tuk" | "pickup" | "van" | "box" | "heavy";
  title: string;
  crew: string;
  suitability: string;
};

export function recommendVehicle(input: PricingInput): VehicleRecommendation {
  if (input.kind === "tow")
    return {
      vehicleClass: "tow_truck",
      art: "tow",
      title: "Reboque plataforma",
      crew: "1 operador",
      suitability: "Transporte seguro de ligeiros e SUV até 3,5 t",
    };
  if (input.kind === "house_move")
    return {
      vehicleClass: "truck",
      art: "box",
      title: "Camião de mudanças",
      crew: `1 motorista\n+ ${input.moving?.helpers ?? 2} ajudantes`,
      suitability: "Ideal para casas completas e mobília volumosa",
    };
  if (input.kind === "small_move")
    return {
      vehicleClass: "van",
      art: "van",
      title: "Carrinha com ajudantes",
      crew: `1 motorista\n+ ${input.moving?.helpers ?? 1} ajudante${(input.moving?.helpers ?? 1) === 1 ? "" : "s"}`,
      suitability: "Ideal para poucos móveis e caixas",
    };
  const cls = input.cargo?.vehicleClass ?? "pickup";
  const helper = input.cargo?.helper;
  const crew = helper ? "1 motorista\n+ 1 ajudante" : "1 motorista";
  if (cls === "tuk_tuk")
    return { vehicleClass: cls, art: "tuk_tuk", title: "Tuk-tuk de entrega", crew: "1 motorista", suitability: "Entregas rápidas de pequenas mercadorias até 100 kg" };
  if (cls === "truck")
    return { vehicleClass: cls, art: "heavy", title: "Camião de carga", crew, suitability: "Materiais, paletes e grandes volumes" };
  if (cls === "van")
    return { vehicleClass: cls, art: "van", title: "Carrinha fechada", crew, suitability: "Carga protegida do sol e da chuva" };
  return {
    vehicleClass: "pickup",
    art: "pickup",
    title: helper ? "Pickup com ajudante" : "Pickup",
    crew,
    suitability: "Ideal para móveis, electrodomésticos e cargas de médio porte",
  };
}
