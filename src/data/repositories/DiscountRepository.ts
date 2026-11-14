import type { Coordinates, PromoPreview, ReferralSummary, ServiceKind } from "@/types/domain";

export type PromoCheck = { code: string; kind: ServiceKind; origin: Coordinates; total: number };

/**
 * Códigos promocionais e convites do cliente autenticado. O desconto em si é
 * aplicado pelo servidor ao criar o pedido (`RequestRepository.create`).
 */
export interface DiscountRepository {
  /** Pré-visualiza o desconto de um código; falha com `validation` se não se aplicar. */
  validatePromo(check: PromoCheck): Promise<PromoPreview>;
  referral(): Promise<ReferralSummary>;
  /** Usa o código de convite de outra pessoa (só antes do primeiro pedido). */
  redeemReferral(code: string): Promise<ReferralSummary>;
}
