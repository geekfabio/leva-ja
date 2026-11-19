import type { CargoDetails, MovingDetails, Photo, Place, PriceBreakdown, ServiceKind, TowDetails } from "@/types/domain";

export type EstimateInput = {
  kind: ServiceKind;
  origin: Place;
  destination: Place;
  stops?: Place[];
  tow?: TowDetails;
  cargo?: CargoDetails;
  moving?: MovingDetails;
  photos?: Photo[];
};

export type Estimate = { distanceKm: number; durationMin: number; price: PriceBreakdown };

/** Preço e trajecto de um pedido antes de ser confirmado: calculados pelo servidor, com a tabela de preços do painel. */
export interface PricingRepository {
  estimate(input: EstimateInput): Promise<Estimate>;
}
