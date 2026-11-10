import * as map from "@/data/api/mappers";
import * as Dto from "@/data/api/dto";
import { RepositoryError } from "@/data/repositories/types";
import { MockDatabase } from "@/data/mock/database";
import { MockRequestRepository } from "@/data/mock/MockRequestRepository";
import { places } from "@/mocks/places";

function setup() {
  const database = new MockDatabase();
  const requests = new MockRequestRepository(database);
  return { database, requests };
}

describe("mapper toNegotiation/fromNegotiation", () => {
  it("converte o formato da API (snake_case, *_kz) para o domínio e de volta", () => {
    const dto: Dto.NegotiationDto = {
      id: "neg_1",
      request_id: "req_1",
      provider_id: "acc_1",
      provider: null,
      amount_kz: 7950,
      min_kz: 6800,
      max_kz: 9200,
      by: "provider",
      status: "pending",
      created_at: "2026-01-01T10:00:00.000Z",
      updated_at: "2026-01-01T10:00:00.000Z",
    };
    const negotiation = map.toNegotiation(dto);
    expect(negotiation).toMatchObject({
      id: "neg_1",
      requestId: "req_1",
      providerId: "acc_1",
      amount: 7950,
      minAmount: 6800,
      maxAmount: 9200,
      by: "provider",
      status: "pending",
    });
    expect(map.fromNegotiation(negotiation)).toEqual(dto);
  });
});

describe("regras de negociação (mock)", () => {
  it("abre dentro de ±15% do preço do serviço, com passo de 50 Kz", async () => {
    const { requests } = setup();
    const request = await requests.create({ kind: "cargo", origin: places.ingombota, destination: places.talatona, clientId: "cli-armando" });
    const service = request.price.total - request.price.platformFee;
    const negotiation = await requests.openNegotiation(request.id, "up", "prv-joao");
    expect(negotiation.providerId).toBe("prv-joao");
    expect(negotiation.by).toBe("provider");
    expect(negotiation.status).toBe("pending");
    expect(negotiation.amount % 50).toBe(0);
    expect(negotiation.amount).toBe(service + 50);
    expect(negotiation.minAmount).toBeLessThanOrEqual(Math.round(service * 0.85));
    expect(negotiation.maxAmount).toBeGreaterThanOrEqual(Math.round(service * 1.15) - 25);
  });

  it("devolve a negociação já aberta pelo mesmo prestador em vez de criar outra", async () => {
    const { requests } = setup();
    const request = await requests.create({ kind: "cargo", origin: places.ingombota, destination: places.talatona, clientId: "cli-armando" });
    const first = await requests.openNegotiation(request.id, "up", "prv-joao");
    const second = await requests.openNegotiation(request.id, "down", "prv-joao");
    expect(second.id).toBe(first.id);
  });

  it("recusa abrir se o prestador não estiver online ou o pedido já não estiver a procurar", async () => {
    const { requests, database } = setup();
    const request = await requests.create({ kind: "cargo", origin: places.ingombota, destination: places.talatona, clientId: "cli-armando" });
    database.providerRecord("prv-joao").online = false;
    await expect(requests.openNegotiation(request.id, "up", "prv-joao")).rejects.toMatchObject({ code: "forbidden" });
    database.providerRecord("prv-joao").online = true;
    await requests.accept(request.id, "prv-joao");
    await expect(requests.openNegotiation(request.id, "up", "prv-mateus")).rejects.toMatchObject({ code: "invalid_transition" });
  });

  it("move o valor ±50 Kz dentro dos limites e alterna quem propôs por último", async () => {
    const { requests } = setup();
    const request = await requests.create({ kind: "cargo", origin: places.ingombota, destination: places.talatona, clientId: "cli-armando" });
    const opened = await requests.openNegotiation(request.id, "up", "prv-joao");
    const adjusted = await requests.adjustNegotiation(request.id, opened.id, "up", "client");
    expect(adjusted.amount).toBe(opened.amount + 50);
    expect(adjusted.by).toBe("client");
    const atMax = await requests.adjustNegotiation(request.id, opened.id, "up");
    expect(atMax.by).toBe("provider");
  });

  it("não deixa aceitar a própria proposta, e aceitar atribui o pedido e cancela as outras pendentes", async () => {
    const { requests } = setup();
    const request = await requests.create({ kind: "cargo", origin: places.ingombota, destination: places.talatona, clientId: "cli-armando" });
    const fromJoao = await requests.openNegotiation(request.id, "up", "prv-joao");
    const fromMateus = await requests.openNegotiation(request.id, "down", "prv-mateus");
    await expect(requests.acceptNegotiation(request.id, fromJoao.id, "provider")).rejects.toMatchObject({ code: "invalid_transition" });
    const assigned = await requests.acceptNegotiation(request.id, fromJoao.id, "client");
    expect(assigned.status).toBe("assigned");
    expect(assigned.providerId).toBe("prv-joao");
    expect(assigned.price.total).toBe(fromJoao.amount + request.price.platformFee);
    const others = await requests.negotiations(request.id);
    expect(others.find((n) => n.id === fromMateus.id)?.status).toBe("cancelled");
    expect(others.find((n) => n.id === fromJoao.id)?.status).toBe("accepted");
  });

  it("aceitar o pedido directamente (via antiga) também cancela as negociações pendentes", async () => {
    const { requests } = setup();
    const request = await requests.create({ kind: "cargo", origin: places.ingombota, destination: places.talatona, clientId: "cli-armando" });
    const negotiation = await requests.openNegotiation(request.id, "up", "prv-mateus");
    await requests.accept(request.id, "prv-joao");
    const after = await requests.negotiations(request.id);
    expect(after.find((n) => n.id === negotiation.id)?.status).toBe("cancelled");
  });

  it("recusar fecha a negociação sem afectar o pedido", async () => {
    const { requests } = setup();
    const request = await requests.create({ kind: "cargo", origin: places.ingombota, destination: places.talatona, clientId: "cli-armando" });
    const negotiation = await requests.openNegotiation(request.id, "up", "prv-joao");
    const declined = await requests.declineNegotiation(request.id, negotiation.id);
    expect(declined.status).toBe("declined");
    expect((await requests.get(request.id)).status).toBe("searching");
  });

  it("erros de domínio chegam como RepositoryError", async () => {
    const { requests } = setup();
    const request = await requests.create({ kind: "cargo", origin: places.ingombota, destination: places.talatona, clientId: "cli-armando" });
    await expect(requests.adjustNegotiation(request.id, "neg-inexistente", "up")).rejects.toBeInstanceOf(RepositoryError);
  });
});
