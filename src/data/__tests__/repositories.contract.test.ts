import type { Repositories } from "@/data";
import { RepositoryError } from "@/data";
import { createMockRepositories } from "@/data/mock";
import { MockDatabase } from "@/data/mock/database";
import { places } from "@/mocks/places";

/**
 * Testes de contrato: descrevem o comportamento que qualquer implementação dos
 * repositórios deve ter. Hoje correm sobre os mocks; a implementação HTTP pode
 * ser validada com a mesma suite contra um servidor de testes.
 */
function contract(name: string, make: () => Repositories) {
  describe(`contrato dos repositórios — ${name}`, () => {
    let repos: Repositories;
    beforeEach(() => {
      repos = make();
    });

    it("pedidos: cria, devolve com cliente incluído e notifica subscritores", async () => {
      const seen: string[] = [];
      const off = repos.requests.subscribe((r) => seen.push(r.status));
      const created = await repos.requests.create({ kind: "cargo", origin: places.ingombota, destination: places.talatona, clientId: "cli-armando" });
      off();
      expect(created.status).toBe("searching");
      expect(created.client?.id).toBe("cli-armando");
      expect(seen).toEqual(["searching"]);
      expect((await repos.requests.get(created.id)).id).toBe(created.id);
    });

    it("pedidos: recusa transições fora da máquina de estados com RepositoryError", async () => {
      const created = await repos.requests.create({ kind: "tow", origin: places.maianga, destination: places.talatona, clientId: "cli-armando" });
      await expect(repos.requests.transition(created.id, "in_transit", "provider")).rejects.toMatchObject({ code: "invalid_transition" });
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
      await repos.auth.register({ name: "Ana Neto", email: "ana@levaja.ao", phone: "923456789", password: "segredo12" });
      await expect(repos.auth.verifyCode("ana@levaja.ao", "000000", "register")).rejects.toMatchObject({ code: "validation" });
      const session = await repos.auth.verifyCode("ana@levaja.ao", "123456", "register");
      expect(session.user.name).toBe("Ana Neto");
      expect(session.user.phone).toBe("+244 923 456 789");
    });

    it("autenticação: o token retoma a sessão até ao logout", async () => {
      const session = await repos.auth.login("joao@levaja.ao", "segredo12", "provider");
      expect(session.token).toBeTruthy();
      const restored = await repos.auth.restore(session.token);
      expect(restored.user.id).toBe(session.user.id);
      expect(restored.providerId).toBe(session.providerId);
      await repos.auth.logout(session.token);
      await expect(repos.auth.restore(session.token)).rejects.toMatchObject({ code: "unauthorized" });
      await expect(repos.auth.restore("token-inventado")).rejects.toMatchObject({ code: "unauthorized" });
    });

    it("suporte e localização", async () => {
      expect((await repos.support.searchHelp("recibo")).length).toBeGreaterThan(0);
      await expect(repos.support.createTicket({ requestId: "x", reason: "Outro", description: "curto" })).rejects.toMatchObject({ code: "validation" });
      expect((await repos.locations.search("talatona"))[0]?.area).toBe("Talatona");
    });
  });
}

contract("mock", () => createMockRepositories(new MockDatabase()));
