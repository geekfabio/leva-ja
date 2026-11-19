import type { CargoDetails, MovingDetails, PriceBreakdown, ServiceKind, TowDetails, VehicleClass } from "@/types/domain";

export type VehicleInput = {
  kind: ServiceKind;
  tow?: Partial<TowDetails>;
  cargo?: Partial<CargoDetails>;
  moving?: Partial<MovingDetails>;
};

/** O que o cliente entrega ao prestador: o total menos o desconto (código promocional ou convite). */
export const payable = (price: PriceBreakdown) => Math.max(0, price.total - (price.discount ?? 0));

/** Serviços cujo preço final é proposto pelo prestador. */
export const needsProposal = (kind: ServiceKind) => kind === "house_move";

export type VehicleRecommendation = {
  vehicleClass: VehicleClass;
  art: "tow" | "tuk_tuk" | "pickup" | "van" | "box" | "heavy";
  title: string;
  crew: string;
  suitability: string;
};

export function recommendVehicle(input: VehicleInput): VehicleRecommendation {
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
