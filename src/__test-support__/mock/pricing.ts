import type { PriceBreakdown, ServiceKind } from "@/types/domain";
import type { VehicleInput } from "@/features/booking/pricing";

/**
 * Preços locais da demonstração (só testes): a app real pede o preço ao
 * servidor (`POST /pricing/estimate`). Espelham os valores por omissão da API.
 */
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

export type PricingInput = VehicleInput & { distanceKm: number };

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
