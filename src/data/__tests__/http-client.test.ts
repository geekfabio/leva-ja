import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import { configureMock } from "@/__test-support__/mock";
import { http, onUnauthorized, setAuthToken, toRepositoryError } from "@/data/http/client";
import { createApiRepositories } from "@/data/api/ApiRepositories";
import { MockDatabase } from "@/__test-support__/mock/database";
import { createMockServer } from "@/__test-support__/mock/server";
import { parseEnv } from "@/config/env";

const config = (headers: Record<string, string> = {}) => ({ headers: new AxiosHeaders(headers) }) as InternalAxiosRequestConfig;
const httpError = (status: number, headers?: Record<string, string>, data?: unknown) =>
  new AxiosError("falhou", "ERR_BAD_RESPONSE", config(headers), {}, { status, statusText: "", data, headers: {}, config: config(headers) });

describe("cliente HTTP", () => {
  beforeEach(() => {
    http.defaults.adapter = createMockServer(new MockDatabase()).adapter;
    setAuthToken(null);
  });
  afterEach(() => configureMock({ failNetwork: false }));

  it("converte estados HTTP em RepositoryError com mensagem do servidor ou em pt-PT", () => {
    expect(toRepositoryError(httpError(422, {}, { message: "Morada inválida." }))).toMatchObject({ code: "validation", message: "Morada inválida." });
    expect(toRepositoryError(httpError(409))).toMatchObject({ code: "invalid_transition" });
    expect(toRepositoryError(httpError(503))).toMatchObject({ code: "server" });
    expect(toRepositoryError(httpError(429))).toMatchObject({ code: "server" });
    expect(toRepositoryError(new AxiosError("timeout", "ECONNABORTED", config()))).toMatchObject({ code: "network" });
  });

  it("um 401 só conta como sessão expirada quando o pedido levava token", () => {
    const listener = jest.fn();
    const off = onUnauthorized(listener);
    toRepositoryError(httpError(401));
    expect(listener).not.toHaveBeenCalled();
    toRepositoryError(httpError(401, { Authorization: "Bearer x" }));
    expect(listener).toHaveBeenCalledTimes(1);
    off();
  });

  it("endpoints protegidos exigem token; o login envia-o nos pedidos seguintes", async () => {
    const repos = createApiRepositories();
    await expect(repos.requests.list()).rejects.toMatchObject({ code: "unauthorized" });
    await expect(repos.auth.login("armando@email.com", "123", "client")).rejects.toMatchObject({ code: "unauthorized" });
    await repos.auth.login("armando@email.com", "segredo12", "client");
    expect((await repos.requests.list({ clientId: "cli-armando" })).length).toBeGreaterThan(0);
  });

  it("sem rede, a leitura é repetida uma vez e depois falha com código network", async () => {
    const repos = createApiRepositories();
    await repos.auth.login("armando@email.com", "segredo12", "client");
    configureMock({ failNetwork: true });
    await expect(repos.providers.listZones()).rejects.toMatchObject({ code: "network" });
  });

  it("o tempo real por polling entrega cada alteração uma vez", async () => {
    const repos = createApiRepositories({ pollIntervalMs: 5 });
    await repos.auth.login("armando@email.com", "segredo12", "client");
    const [first] = await repos.requests.list({ clientId: "cli-armando", status: ["searching", "assigned", "en_route"] });
    const created = first ?? (await repos.requests.create({ kind: "cargo", origin: { id: "a", label: "A", area: "Ingombota", city: "Luanda", coords: { latitude: -8.81, longitude: 13.23 } }, destination: { id: "b", label: "B", area: "Talatona", city: "Luanda", coords: { latitude: -8.92, longitude: 13.18 } }, clientId: "cli-armando" }));
    const seen: string[] = [];
    const off = repos.requests.subscribe((r: { id: string; status: string }) => seen.push(`${r.id}:${r.status}`));
    await new Promise((resolve) => setTimeout(resolve, 20));
    await repos.requests.cancel(created.id, "Já não preciso");
    await new Promise((resolve) => setTimeout(resolve, 60));
    off();
    expect(seen).toEqual([`${created.id}:cancelled`]);
  });
});

describe("configuração (.env)", () => {
  const base = { apiUrl: "http://api.test", apiTimeoutMs: undefined, pollIntervalMs: undefined, realtimeUrl: undefined, mapTilesUrl: undefined, routingUrl: undefined };

  it("exige a URL da API e aplica os valores por omissão", () => {
    expect(parseEnv(base)).toEqual({
      apiUrl: "http://api.test",
      apiTimeoutMs: 10000,
      pollIntervalMs: 5000,
      mapTilesUrl: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      routingUrl: "https://router.project-osrm.org",
    });
  });

  it("recusa a configuração sem URL da API e valores inválidos", () => {
    expect(() => parseEnv({ ...base, apiUrl: undefined })).toThrow(/EXPO_PUBLIC_API_URL/);
    expect(() => parseEnv({ ...base, apiUrl: "não é um url" })).toThrow(/Configuração inválida/);
    expect(parseEnv({ ...base, pollIntervalMs: "2000", realtimeUrl: "wss://api.test/realtime" })).toMatchObject({ pollIntervalMs: 2000, realtimeUrl: "wss://api.test/realtime" });
  });
});
