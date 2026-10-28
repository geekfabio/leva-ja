import { createApiRepositories } from "@/data/api/ApiRepositories";
import { http } from "@/data/http/client";
import { MockDatabase } from "@/data/mock/database";
import { createMockServer } from "@/data/mock/server";
import { places } from "@/mocks/places";
import { deliveryPhotos } from "@/mocks/photos";

const tick = (ms = 20) => new Promise((resolve) => setTimeout(resolve, ms));

/** Pedido entregue, pronto a pagar, criado pelo cliente da sessão. */
async function delivered() {
  const server = createMockServer(new MockDatabase());
  http.defaults.adapter = server.adapter;
  const repos = createApiRepositories({ realtime: server.socket });
  await repos.auth.login("joao.manuel@angoleva.ao", "segredo12", "provider");
  const r = await repos.requests.create({ kind: "cargo", origin: places.ingombota, destination: places.talatona, clientId: "cli-armando" });
  await repos.requests.accept(r.id, "prv-joao");
  for (const to of ["en_route", "arrived"] as const) await repos.requests.transition(r.id, to, "provider");
  await repos.requests.transition(r.id, "pickup_confirmed", "client");
  await repos.requests.transition(r.id, "in_transit", "provider");
  await repos.requests.submitProof(r.id, { photos: deliveryPhotos, signedBy: "Armando", goodCondition: true });
  return { repos, request: await repos.requests.get(r.id) };
}

describe("pagamentos (API)", () => {
  it("cartão: confirmado logo e o pedido fica pago", async () => {
    const { repos, request } = await delivered();
    const payment = await repos.payments.start(request.id, "card");
    expect(payment).toMatchObject({ status: "confirmed", method: "card", amount: request.price.total, reference: undefined });
    expect((await repos.requests.get(request.id)).status).toBe("paid");
  });

  it("referência Multicaixa: pendente com entidade, referência e validade; o banco confirma depois", async () => {
    const { repos, request } = await delivered();
    const statuses: string[] = [];
    const off = repos.requests.subscribe((r) => r.id === request.id && statuses.push(r.status));
    const payment = await repos.payments.start(request.id, "bank_reference");
    expect(payment.status).toBe("pending");
    expect(payment.reference).toMatchObject({ entity: "11223", reference: expect.stringMatching(/^\d{9}$/) });
    expect(new Date(payment.reference!.expiresAt).getTime()).toBeGreaterThan(Date.now() + 47 * 3600_000);
    // Pedir de novo devolve o mesmo pagamento pendente.
    expect((await repos.payments.start(request.id, "bank_reference")).id).toBe(payment.id);

    await tick();
    off();
    expect((await repos.payments.get(payment.id)).status).toBe("confirmed");
    expect(statuses).toContain("paid");
  });

  it("não se paga antes da entrega", async () => {
    const server = createMockServer(new MockDatabase());
    http.defaults.adapter = server.adapter;
    const repos = createApiRepositories({ realtime: server.socket });
    await repos.auth.login("armando@email.com", "segredo12", "client");
    const r = await repos.requests.create({ kind: "tow", origin: places.maianga, destination: places.talatona, clientId: "cli-armando" });
    await expect(repos.payments.start(r.id, "card")).rejects.toMatchObject({ code: "invalid_transition" });
  });

  it("só o cliente do pedido paga ou consulta o pagamento", async () => {
    const { repos, request } = await delivered();
    const payment = await repos.payments.start(request.id, "bank_reference");
    await repos.auth.login("carlos.mendes@email.com", "segredo12", "client");
    await expect(repos.payments.get(payment.id)).rejects.toMatchObject({ code: "forbidden" });
    await expect(repos.payments.start(request.id, "card")).rejects.toMatchObject({ code: "forbidden" });
  });
});
