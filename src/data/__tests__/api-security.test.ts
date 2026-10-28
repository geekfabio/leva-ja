import { configureMock, mockRuntime } from "@/data";
import { createApiRepositories } from "@/data/api/ApiRepositories";
import { http, onTokensRefreshed, onUnauthorized, setAuthTokens } from "@/data/http/client";
import { MockDatabase } from "@/data/mock/database";
import { createMockServer } from "@/data/mock/server";
import { places } from "@/mocks/places";

const TTL = mockRuntime.accessTokenTtlMs;

function strictApi() {
  const database = new MockDatabase();
  http.defaults.adapter = createMockServer(database, { simulation: false }).adapter;
  return { database, repos: createApiRepositories({ pollIntervalMs: 5 }) };
}

afterEach(() => {
  configureMock({ accessTokenTtlMs: TTL });
  setAuthTokens(null);
});

describe("API: regras de acesso por recurso", () => {
  it("um cliente só vê e altera o que é seu", async () => {
    const { repos } = strictApi();
    await repos.auth.login("armando@email.com", "segredo12", "client");
    const mine = await repos.requests.list();
    expect(mine.length).toBeGreaterThan(0);
    expect(mine.every((r) => r.clientId === "cli-armando")).toBe(true);

    await expect(repos.requests.list({ clientId: "cli-carlos" })).rejects.toMatchObject({ code: "forbidden" });
    await expect(repos.account.addresses("cli-carlos")).rejects.toMatchObject({ code: "forbidden" });
    await expect(repos.providers.getState("prv-joao")).rejects.toMatchObject({ code: "forbidden" });
    await expect(repos.requests.create({ kind: "cargo", origin: places.ingombota, destination: places.talatona, clientId: "cli-carlos" })).rejects.toMatchObject({
      code: "forbidden",
    });
  });

  it("o actor de cada acção é verificado; o actor system só existe na simulação", async () => {
    const { repos } = strictApi();
    await repos.auth.login("armando@email.com", "segredo12", "client");
    const created = await repos.requests.create({ kind: "cargo", origin: places.ingombota, destination: places.talatona, clientId: "cli-armando" });
    await expect(repos.requests.transition(created.id, "assigned", "system")).rejects.toMatchObject({ code: "forbidden" });
    await expect(repos.requests.transition(created.id, "en_route", "provider")).rejects.toMatchObject({ code: "forbidden" });
    await expect(repos.requests.accept(created.id, "prv-joao")).rejects.toMatchObject({ code: "forbidden" });
  });

  it("um prestador vê pedidos à procura de prestador, mas não os de outros já atribuídos", async () => {
    const { repos } = strictApi();
    await repos.auth.login("joao.manuel@angoleva.ao", "segredo12", "provider");
    const nearby = await repos.requests.nearby("prv-joao");
    expect(nearby.length).toBeGreaterThan(0);
    expect((await repos.requests.get(nearby[0]!.request.id)).status).toBe("searching");
    await expect(repos.providers.setOnline("prv-paulo", false)).rejects.toMatchObject({ code: "forbidden" });
  });
});

describe("API: renovação do token de acesso", () => {
  it("com o token expirado, renova-o uma vez e repete o pedido sem o utilizador notar", async () => {
    const { repos } = strictApi();
    configureMock({ accessTokenTtlMs: 1 });
    const session = await repos.auth.login("armando@email.com", "segredo12", "client");
    configureMock({ accessTokenTtlMs: TTL });
    await new Promise((resolve) => setTimeout(resolve, 5));

    const refreshed = jest.fn();
    const expired = jest.fn();
    const offRefreshed = onTokensRefreshed(refreshed);
    const offExpired = onUnauthorized(expired);
    // Dois pedidos em paralelo: uma só renovação.
    const [a, b] = await Promise.all([repos.requests.list(), repos.account.addresses("cli-armando")]);
    offRefreshed();
    offExpired();

    expect(a.length).toBeGreaterThan(0);
    expect(b.length).toBeGreaterThan(0);
    expect(refreshed).toHaveBeenCalledTimes(1);
    expect(refreshed.mock.calls[0][0].token).not.toBe(session.token);
    expect(expired).not.toHaveBeenCalled();
    // Rotação: o refresh token antigo já não serve.
    await expect(repos.auth.refresh(session.refreshToken!)).rejects.toMatchObject({ code: "unauthorized" });
  });

  it("se a renovação falhar, a sessão expira", async () => {
    const { repos } = strictApi();
    configureMock({ accessTokenTtlMs: 1 });
    const session = await repos.auth.login("armando@email.com", "segredo12", "client");
    await new Promise((resolve) => setTimeout(resolve, 5));
    setAuthTokens({ token: session.token, refreshToken: "refresh-inventado" });
    const expired = jest.fn();
    const off = onUnauthorized(expired);
    await expect(repos.requests.list()).rejects.toMatchObject({ code: "unauthorized" });
    off();
    expect(expired).toHaveBeenCalledTimes(1);
  });
});
