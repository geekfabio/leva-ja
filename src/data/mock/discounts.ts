import type { PromoPreview, ReferralSummary, ServiceRequest } from "@/types/domain";
import { RepositoryError } from "../repositories/types";
import type { MockDatabase } from "./database";

/**
 * Descontos do servidor simulado, com as mesmas regras do backend real em
 * ponto pequeno: um código promocional de demonstração (uma vez por cliente)
 * e convites em que os dois lados ganham um desconto para o pedido seguinte.
 */
export const DEMO_PROMO = { code: "LUANDA10", percent: 10, max: 1500 };
export const DEMO_REFERRAL = { invitee: 500, inviter: 500 };
/** Bónus de demonstração que a plataforma dá ao prestador por corrida entregue. */
export const DEMO_DRIVER_BONUS = 250;
const STEP = 50;

export type MockReward = { id: string; clientId: string; kind: "invitee" | "inviter"; sourceId: string; amount: number; usedRequestId?: string; at: string };
export type AppliedDiscount = { discount: number; label: string; promo?: string; rewardId?: string };

const invalid = (message: string): never => {
  throw new RepositoryError("validation", message);
};

export const referralCodeFor = (clientId: string) => `AL${clientId.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(-6).padStart(6, "X")}`;

export function previewPromo(database: MockDatabase, clientId: string, code: string, total: number): PromoPreview {
  const normalized = code.trim().toUpperCase();
  if (normalized !== DEMO_PROMO.code) invalid("Código promocional inválido.");
  if (database.promoUses.some((use) => use.clientId === clientId && use.code === normalized)) invalid("Já usaste este código.");
  const discount = Math.floor(Math.min((total * DEMO_PROMO.percent) / 100, DEMO_PROMO.max, total) / STEP) * STEP;
  if (discount <= 0) invalid("Este código não se aplica a este pedido.");
  return { code: normalized, discount, label: `Código ${normalized}` };
}

/** Um desconto por pedido: o código indicado ou, sem código, o convite mais antigo por usar. */
export function discountFor(database: MockDatabase, clientId: string, total: number, promoCode?: string): AppliedDiscount | null {
  if (promoCode) {
    const preview = previewPromo(database, clientId, promoCode, total);
    return { discount: preview.discount, label: preview.label, promo: preview.code };
  }
  const reward = database.rewards.find((r) => r.clientId === clientId && !r.usedRequestId);
  if (!reward) return null;
  return { discount: Math.min(reward.amount, total), label: "Desconto de convite", rewardId: reward.id };
}

export function recordDiscount(database: MockDatabase, request: ServiceRequest, applied: AppliedDiscount) {
  if (applied.promo) database.promoUses.push({ code: applied.promo, clientId: request.clientId, requestId: request.id });
  const reward = database.rewards.find((r) => r.id === applied.rewardId);
  if (reward) reward.usedRequestId = request.id;
}

/** Pedido cancelado: o desconto volta a ficar disponível. */
export function releaseDiscount(database: MockDatabase, requestId: string) {
  database.promoUses = database.promoUses.filter((use) => use.requestId !== requestId);
  database.rewards.forEach((r) => {
    if (r.usedRequestId === requestId) r.usedRequestId = undefined;
  });
}

export function referralSummary(database: MockDatabase, clientId: string): ReferralSummary {
  const rewards = database.rewards.filter((r) => r.clientId === clientId);
  return {
    enabled: true,
    code: referralCodeFor(clientId),
    inviteeDiscount: DEMO_REFERRAL.invitee,
    inviterDiscount: DEMO_REFERRAL.inviter,
    redeemed: database.referredBy.has(clientId),
    invitedCount: [...database.referredBy.values()].filter((inviter) => inviter === clientId).length,
    available: rewards.filter((r) => !r.usedRequestId).reduce((sum, r) => sum + r.amount, 0),
    rewards: rewards.map((r) => ({ id: r.id, kind: r.kind, amount: r.amount, used: !!r.usedRequestId, at: r.at })),
  };
}

export function redeemReferral(database: MockDatabase, clientId: string, code: string) {
  if (database.referredBy.has(clientId)) invalid("Já usaste um código de convite.");
  const normalized = code.trim().toUpperCase();
  const inviter = [...database.clients.keys()].find((id) => referralCodeFor(id) === normalized);
  if (!inviter) invalid("Código de convite inválido.");
  if (inviter === clientId) invalid("Não podes usar o teu próprio código.");
  const settled = [...database.requests.values()].some((r) => r.clientId === clientId && (r.status === "paid" || r.status === "rated"));
  if (settled) invalid("O código de convite é só para quem ainda não fez nenhum pedido.");
  database.referredBy.set(clientId, inviter!);
  database.rewards.push({ id: `rwd-${database.rewards.length + 1}`, clientId, kind: "invitee", sourceId: inviter!, amount: DEMO_REFERRAL.invitee, at: new Date().toISOString() });
}

/** Primeiro pedido pago de um convidado: quem o convidou ganha o seu desconto (uma vez). */
export function rewardInviter(database: MockDatabase, clientId: string) {
  const inviter = database.referredBy.get(clientId);
  if (!inviter) return;
  if (database.rewards.some((r) => r.clientId === inviter && r.kind === "inviter" && r.sourceId === clientId)) return;
  database.rewards.push({ id: `rwd-${database.rewards.length + 1}`, clientId: inviter, kind: "inviter", sourceId: clientId, amount: DEMO_REFERRAL.inviter, at: new Date().toISOString() });
}
