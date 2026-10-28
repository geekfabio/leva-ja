import type { Repositories } from "@/data";
import { RepositoryError } from "@/data";
import { http } from "@/data/http/client";
import { createApiRepositories } from "@/data/api/ApiRepositories";
import { createMockRepositories } from "@/data/mock";
import { MockDatabase } from "@/data/mock/database";
import { createMockServer } from "@/data/mock/server";
import { places } from "@/mocks/places";

/** Espera que a condição se cumpra (o tempo real por polling não é imediato). */
async function eventually(check: () => boolean, timeoutMs = 1000) {
  const start = Date.now();
  while (!check()) {
    if (Date.now() - start > timeoutMs) throw new Error("Condição não cumprida a tempo.");
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

/**
 * Testes de contrato: descrevem o comportamento que qualquer implementação dos
 * repositórios deve ter. Correm sobre os mocks e sobre a implementação HTTP
 * (com a API simulada); contra um servidor de testes basta outra entrada
 * `contract(...)` com EXPO_PUBLIC_API_URL a apontar para ele.
 */
function contract(name: string, make: () => Promise<Repositories>) {
  describe(`contrato dos repositórios — ${name}`, () => {
    let repos: Repositories;
    beforeEach(async () => {
      repos = await make();
    });

    it("pedidos: cria, devolve com cliente incluído e notifica subscritores", async () => {
      const seen: string[] = [];
      const off = repos.requests.subscribe((r) => seen.push(r.status));
      const created = await repos.requests.create({ kind: "cargo", origin: places.ingombota, destination: places.talatona, clientId: "cli-armando" });
      expect(created.status).toBe("searching");
      expect(created.client?.id).toBe("cli-armando");
      await eventually(() => seen.length > 0);
      off();
      expect(seen).toEqual(["searching"]);
      expect((await repos.requests.get(created.id)).id).toBe(created.id);
    });

    it("pedidos: recusa transições fora da máquina de estados com RepositoryError", async () => {
      const created = await repos.requests.create({ kind: "tow", origin: places.maianga, destination: places.talatona, clientId: "cli-armando" });
      await expect(repos.requests.transition(created.id, "delivered", "system")).rejects.toMatchObject({ code: "invalid_transition" });
      await expect(repos.requests.get("nao-existe")).rejects.toBeInstanceOf(RepositoryError);
    });

    it("prestador: estado, cobertura validada e pedidos próximos filtrados pelos serviços", async () => {
      const state = await repos.providers.getState("prv-joao");
      expect(state.profile.name).toBe("João Manuel");
      await expect(repos.providers.saveCoverage("prv-joao", { zones: [], services: [] })).rejects.toMatchObject({ code: "validation" });
      await repos.providers.saveCoverage("prv-joao", { zones: ["zone-luanda"], services: ["tow"] });
      const nearby = await repos.requests.nearby("prv-joao");
      expect(nearby.every((n) => n.request.kind === "tow")).toBe(true);
    });

    it("conta: endereços e métodos de pagamento por cliente", async () => {
      const before = await repos.account.addresses("cli-armando");
      await repos.account.addAddress("cli-armando", { label: "Escritório", place: places.alvalade, icon: "work" });
      expect(await repos.account.addresses("cli-armando")).toHaveLength(before.length + 1);
      const methods = await repos.account.setDefaultPayment("cli-armando", "pm-cash");
      expect(methods.find((m) => m.isDefault)?.id).toBe("pm-cash");
    });

    it("autenticação: código errado é recusado; registo confirmado cria o cliente", async () => {
      await repos.auth.register({ name: "Ana Neto", email: "ana@angoleva.ao", phone: "923456789", password: "segredo12" });
      await expect(repos.auth.verifyCode("ana@angoleva.ao", "000000", "register")).rejects.toMatchObject({ code: "validation" });
      const session = await repos.auth.verifyCode("ana@angoleva.ao", "123456", "register");
      expect(session.user.name).toBe("Ana Neto");
      expect(session.user.phone).toBe("+244 923 456 789");
    });

    it("autenticação: o token retoma a sessão até ao logout", async () => {
      const session = await repos.auth.login("joao@angoleva.ao", "segredo12", "provider");
      expect(session.token).toBeTruthy();
      const restored = await repos.auth.restore(session.token);
      expect(restored.user.id).toBe(session.user.id);
      expect(restored.providerId).toBe(session.providerId);
      await repos.auth.logout(session.token);
      await expect(repos.auth.restore(session.token)).rejects.toMatchObject({ code: "unauthorized" });
      await expect(repos.auth.restore("token-inventado")).rejects.toMatchObject({ code: "unauthorized" });
    });

    it("chat: a mensagem enviada fica na conversa e a resposta chega em tempo real", async () => {
      const thread = "support-client";
      const before = await repos.chat.messages(thread, "support");
      const replies: string[] = [];
      const off = repos.chat.subscribe(thread, (event) => {
        if (event.type === "message" && event.message.from === "support") replies.push(event.message.text);
      });
      await new Promise((resolve) => setTimeout(resolve, 20));
      const sent = await repos.chat.send(thread, "client", "Preciso de ajuda com o recibo");
      expect(sent).toMatchObject({ from: "client", text: "Preciso de ajuda com o recibo" });
      await eventually(() => replies.length > 0);
      off();
      expect(await repos.chat.messages(thread, "support")).toHaveLength(before.length + 2);
    });

    it("suporte e localização", async () => {
      expect((await repos.support.searchHelp("recibo")).length).toBeGreaterThan(0);
      await expect(repos.support.createTicket({ requestId: "x", reason: "Outro", description: "curto" })).rejects.toMatchObject({ code: "validation" });
      expect((await repos.locations.search("talatona"))[0]?.area).toBe("Talatona");
    });
  });
}

// Serviços mock: as regras de negócio do "backend" simulado.
contract("serviços mock", async () => createMockRepositories(new MockDatabase()));

// O que a app usa: repositórios da API sobre a API simulada (formato da API, tempo real por socket).
contract("API simulada (socket)", async () => {
  const server = createMockServer(new MockDatabase());
  http.defaults.adapter = server.adapter;
  const repos = createApiRepositories({ realtime: server.socket });
  await repos.auth.login("joao.manuel@angoleva.ao", "segredo12", "provider");
  return repos;
});

// Igual, mas com o tempo real por polling (como com a API REST real hoje).
contract("API simulada (polling)", async () => {
  http.defaults.adapter = createMockServer(new MockDatabase()).adapter;
  const repos = createApiRepositories({ pollIntervalMs: 5 });
  await repos.auth.login("joao.manuel@angoleva.ao", "segredo12", "provider");
  return repos;
});
