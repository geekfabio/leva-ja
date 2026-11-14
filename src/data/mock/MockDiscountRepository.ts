import type { DiscountRepository, PromoCheck } from "../repositories/DiscountRepository";
import { db, type MockDatabase } from "./database";
import { previewPromo, redeemReferral, referralSummary } from "./discounts";
import { DEMO_CLIENT } from "./demo";
import { simulate } from "./runtime";

/**
 * Descontos do servidor simulado. O contrato não leva o cliente (na API real
 * vem do token); aqui o servidor simulado passa-o como argumento extra.
 */
export class MockDiscountRepository implements DiscountRepository {
  constructor(private readonly database: MockDatabase = db) {}

  validatePromo(check: PromoCheck, clientId: string = DEMO_CLIENT.id) {
    return simulate(() => previewPromo(this.database, clientId, check.code, check.total));
  }

  referral(clientId: string = DEMO_CLIENT.id) {
    return simulate(() => referralSummary(this.database, clientId));
  }

  redeemReferral(code: string, clientId: string = DEMO_CLIENT.id) {
    return simulate(() => {
      redeemReferral(this.database, clientId, code);
      return referralSummary(this.database, clientId);
    });
  }
}
