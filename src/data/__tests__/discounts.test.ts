import * as map from "@/data/api/mappers";
import * as Dto from "@/data/api/dto";
import { createApiRepositories } from "@/data/api/ApiRepositories";
import { http } from "@/data/http/client";
import { MockDatabase } from "@/data/mock/database";
import { MockDiscountRepository } from "@/data/mock/MockDiscountRepository";
import { MockProviderRepository } from "@/data/mock/MockProviderRepository";
import { MockRequestRepository } from "@/data/mock/MockRequestRepository";
import { DEMO_DRIVER_BONUS, DEMO_PROMO, DEMO_REFERRAL, referralCodeFor } from "@/data/mock/discounts";
import { createMockServer } from "@/data/mock/server";
import { payable } from "@/features/booking/pricing";
import { places } from "@/mocks/places";

const CLIENT = "cli-armando";

function setup() {
  const database = new MockDatabase();
  // Um cliente novo, ainda sem pedidos: só esses podem usar um código de convite.
  const friend = "cli-novo";
  database.clients.set(friend, { ...database.clients.get(CLIENT)!, id: friend, name: "Cliente Novo", email: "novo@email.com" });
  return {
    database,
    friend,
    requests: new MockRequestRepository(database),
    discounts: new MockDiscountRepository(database),
    providers: new MockProviderRepository(database),
  };
}

const order = (clientId: string, promoCode?: string) => ({
  kind: "cargo" as const,
  clientId,
  origin: places.ingombota,
  destination: places.talatona,
  cargo: { cargoType: "boxes" as const, description: "Caixas", weight: "upto100" as const, volume: "small" as const, vehicleClass: "pickup" as const, helper: false },
  paymentMethod: "cash" as const,
  promoCode,
});

/** Leva um pedido acabado de criar até à entrega, pelo prestador de demonstração. */
async function deliver(requests: MockRequestRepository, id: string) {
  await requests.accept(id, "prv-joao");
  await requests.transition(id, "en_route", "provider");
  await requests.transition(id, "arrived", "provider");
  await requests.transition(id, "pickup_confirmed", "client");
  await requests.transition(id, "in_transit", "provider");
  return requests.submitProof(id, { photos: [], signedBy: "Cliente", goodCondition: true });
}

describe("numerário: sem passo de pagamento", () => {
  it("a entrega fecha o pedido como pago e o prestador recebe o bónus da plataforma", async () => {
    const { requests, providers } = setup();
    const created = await requests.create(order(CLIENT));
    const done = await deliver(requests, created.id);
    expect(done.status).toBe("paid");
    expect(done.timeline.slice(-2).map((e) => e.status)).toEqual(["delivered", "paid"]);

    const state = await providers.getState("prv-joao");
    expect(state.wallet.transactions.find((t) => t.id === `bonus-${created.id}`)).toMatchObject({ kind: "bonus", amount: DEMO_DRIVER_BONUS });
    expect(await providers.cashBalance("prv-joao")).toMatchObject({ bonusKz: DEMO_DRIVER_BONUS, balanceKz: DEMO_DRIVER_BONUS, blocked: false });
  });
});

describe("código promocional", () => {
  it("desconta no pedido, só uma vez por cliente, e volta a ficar disponível se o pedido for cancelado", async () => {
    const { requests, discounts } = setup();
    const plain = await requests.create(order(CLIENT));
    const preview = await discounts.validatePromo({ code: DEMO_PROMO.code.toLowerCase(), kind: "cargo", origin: places.ingombota.coords, total: plain.price.total }, CLIENT);
    expect(preview.discount).toBeGreaterThan(0);
    expect(preview.discount).toBeLessThanOrEqual(DEMO_PROMO.max);

    const discounted = await requests.create(order(CLIENT, DEMO_PROMO.code));
    expect(discounted.price.discount).toBe(preview.discount);
    expect(payable(discounted.price)).toBe(discounted.price.total - preview.discount);

    await expect(requests.create(order(CLIENT, DEMO_PROMO.code))).rejects.toMatchObject({ code: "validation" });
    await requests.cancel(discounted.id, "teste");
    expect((await requests.create(order(CLIENT, DEMO_PROMO.code))).price.discount).toBe(preview.discount);
  });

  it("um código que não existe é recusado", async () => {
    const { discounts } = setup();
    await expect(discounts.validatePromo({ code: "NAOEXISTE", kind: "tow", origin: places.ingombota.coords, total: 9000 }, CLIENT)).rejects.toMatchObject({ code: "validation" });
  });
});

describe("convites", () => {
  it("o convidado ganha desconto no primeiro pedido; quem convidou ganha quando esse pedido é pago", async () => {
    const { requests, discounts, friend } = setup();
    const code = (await discounts.referral(CLIENT)).code;
    expect(code).toBe(referralCodeFor(CLIENT));

    await expect(discounts.redeemReferral(code, CLIENT)).rejects.toMatchObject({ code: "validation" });
    const redeemed = await discounts.redeemReferral(code.toLowerCase(), friend);
    expect(redeemed).toMatchObject({ redeemed: true, available: DEMO_REFERRAL.invitee });
    await expect(discounts.redeemReferral(code, friend)).rejects.toMatchObject({ code: "validation" });

    const first = await requests.create(order(friend));
    expect(first.price.discount).toBe(DEMO_REFERRAL.invitee);
    expect((await discounts.referral(CLIENT)).available).toBe(0);

    await deliver(requests, first.id);
    const mine = await discounts.referral(CLIENT);
    expect(mine).toMatchObject({ invitedCount: 1, available: DEMO_REFERRAL.inviter });
    expect((await requests.create(order(CLIENT))).price.discount).toBe(DEMO_REFERRAL.inviter);
  });
});

describe("contrato com a API", () => {
  it("o desconto do pedido e os convites passam pelos mappers nos dois sentidos", () => {
    const pricing = { base_kz: 5000, distance_kz: 2000, extras_kz: 0, platform_fee_kz: 500, total_kz: 7500, discount_kz: 700, discount_label: "Código LUANDA10" };
    const summary: Dto.ReferralSummaryDto = {
      enabled: true,
      code: "ALARMAND",
      invitee_discount_kz: 500,
      inviter_discount_kz: 700,
      redeemed: false,
      invited_count: 2,
      available_kz: 700,
      rewards: [{ id: "rwd_1", kind: "inviter", amount_kz: 700, used: false, created_at: "2026-01-01T10:00:00.000Z" }],
    };
    expect(map.fromReferralSummary(map.toReferralSummary(summary))).toEqual(summary);
    expect(Dto.PricingDto.parse(pricing)).toEqual(pricing);
  });

  it("estado do prestador real: conta bancária por indicar, documento rejeitado e bónus não partem a app", () => {
    const dto = Dto.ProviderCashBalanceDto.parse({ owed_kz: 1800, deposited_kz: 0, balance_kz: -1800, blocked: true });
    expect(map.toCashBalance(dto)).toMatchObject({ creditsKz: 0, bonusKz: 0, balanceKz: -1800, blocked: true });
    expect(Dto.TransactionDto.safeParse({ id: "tx_1", type: "bonus", title: "Bónus", amount_kz: 300, created_at: "2026-01-01T10:00:00.000Z", status: "completed", service_type: "tow" }).success).toBe(true);
    expect(map.toDocument({ id: "doc_1", title: "Carta", kind: "license", valid_until: null, status: "rejected" })).toMatchObject({ state: "needs_update", validUntil: "" });
  });

  it("pela API (simulada): a app envia o código ao criar o pedido e lê o desconto na resposta", async () => {
    http.defaults.adapter = createMockServer(new MockDatabase()).adapter;
    const repos = createApiRepositories({});
    const session = await repos.auth.login("armando@email.com", "segredo12", "client");
    const created = await repos.requests.create({ ...order(session.user.id, DEMO_PROMO.code) });
    expect(created.price.discount).toBeGreaterThan(0);
    expect(created.price.discountLabel).toMatch(DEMO_PROMO.code);
    const referral = await repos.discounts.referral();
    expect(referral.code).toBe(referralCodeFor(session.user.id));
  });
});
