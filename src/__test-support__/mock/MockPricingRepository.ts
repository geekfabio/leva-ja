import type { PricingRepository } from "@/data/repositories/PricingRepository";
import { estimateMinutes, roadDistanceKm } from "./geo";
import { estimatePrice } from "./pricing";
import { simulate } from "./runtime";

/** Estimativa do servidor simulado: tabela de preços local, só para testes. */
export class MockPricingRepository implements PricingRepository {
  estimate(input: Parameters<PricingRepository["estimate"]>[0]) {
    return simulate(() => {
      const distanceKm = roadDistanceKm(input.origin, input.destination);
      return {
        distanceKm,
        durationMin: estimateMinutes(distanceKm),
        price: estimatePrice({ kind: input.kind, distanceKm, tow: input.tow, cargo: input.cargo, moving: input.moving }),
      };
    });
  }
}
