import { createApiRepositories } from "@/data/api/ApiRepositories";
import { WebSocketRealtime, type SocketLike } from "@/data/api/WebSocketRealtime";
import type { RealtimeChannel } from "@/data/api/realtime";
import { http, setAuthTokens } from "@/data/http/client";
import { MockDatabase } from "@/data/mock/database";
import { DEMO_TOKEN } from "@/data/mock/demo";
import { createMockServer } from "@/data/mock/server";
import { places } from "@/mocks/places";

const tick = (ms = 5) => new Promise((resolve) => setTimeout(resolve, ms));

/** WebSocket falso controlado pelo teste. */
class FakeSocket implements SocketLike {
  static all: FakeSocket[] = [];
  sent: unknown[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  closed = false;
  constructor() {
    FakeSocket.all.push(this);
  }
  send(data: string) {
    this.sent.push(JSON.parse(data));
  }
  close() {
    this.closed = true;
  }
  serverEvent(topic: string, data: unknown) {
    this.onmessage?.({ data: JSON.stringify({ type: "event", topic, data }) });
  }
}

beforeEach(() => {
  FakeSocket.all = [];
});

describe("WebSocketRealtime (cliente)", () => {
  const make = (extra: Partial<ConstructorParameters<typeof WebSocketRealtime>[0]> = {}) =>
    new WebSocketRealtime({ url: "wss://teste", token: () => "tok-1", createSocket: () => new FakeSocket(), heartbeatMs: 60_000, ...extra });

  it("liga-se no primeiro subscribe, autentica-se, subscreve e entrega eventos do tópico", () => {
    const channel = make();
    const got: unknown[] = [];
    channel.subscribe("requests", (p) => got.push(p));
    const socket = FakeSocket.all[0]!;
    socket.onopen?.();
    expect(socket.sent).toEqual([{ type: "auth", token: "tok-1" }, { type: "subscribe", topic: "requests" }]);
    socket.serverEvent("requests", { id: "r1" });
    socket.serverEvent("providers/p1", { ignorado: true });
    expect(got).toEqual([{ id: "r1" }]);
  });

  it("fecha a ligação quando já ninguém está subscrito", () => {
    const channel = make();
    const off = channel.subscribe("requests", () => undefined);
    FakeSocket.all[0]!.onopen?.();
    off();
    expect(FakeSocket.all[0]!.sent).toContainEqual({ type: "unsubscribe", topic: "requests" });
    expect(FakeSocket.all[0]!.closed).toBe(true);
  });

  it("reconecta depois de uma quebra, volta a subscrever e avisa para recarregar", () => {
    jest.useFakeTimers();
    const onReconnect = jest.fn();
    const channel = make({ onReconnect });
    channel.subscribe("threads/r1", () => undefined);
    FakeSocket.all[0]!.onopen?.();
    FakeSocket.all[0]!.onclose?.();
    expect(channel.state).toBe("idle");
    jest.advanceTimersByTime(1000);
    const second = FakeSocket.all[1]!;
    second.onopen?.();
    expect(second.sent).toContainEqual({ type: "subscribe", topic: "threads/r1" });
    expect(onReconnect).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it("se o WebSocket nunca abrir, passa ao canal de recurso (polling)", () => {
    jest.useFakeTimers();
    const fallback: RealtimeChannel = { subscribe: jest.fn(() => () => undefined) };
    const channel = make({ fallback, maxFailures: 2 });
    channel.subscribe("requests", () => undefined);
    FakeSocket.all[0]!.onclose?.();
    jest.advanceTimersByTime(1000);
    FakeSocket.all[1]!.onclose?.();
    expect(channel.state).toBe("fallback");
    expect(fallback.subscribe).toHaveBeenCalledWith("requests", expect.any(Function));
    channel.subscribe("providers/p1", () => undefined);
    expect(fallback.subscribe).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });
});

describe("WebSocket da API simulada (servidor)", () => {
  async function connect(token: string) {
    const server = createMockServer(new MockDatabase());
    const ws = server.connect("mock://realtime");
    const frames: { type: string; topic?: string; code?: string; data?: { client_id?: string } }[] = [];
    let closed = false;
    ws.onmessage = (e) => frames.push(JSON.parse(String(e.data)));
    ws.onclose = () => (closed = true);
    await tick();
    ws.send(JSON.stringify({ type: "auth", token }));
    return { server, ws, frames, isClosed: () => closed };
  }

  it("recusa tokens inválidos e fecha a ligação", async () => {
    const { frames, isClosed } = await connect("inventado");
    await tick();
    expect(frames).toEqual([{ type: "error", code: "unauthorized", message: expect.any(String) }]);
    expect(isClosed()).toBe(true);
  });

  it("aplica as regras de acesso aos tópicos e aos pedidos", async () => {
    const { server, ws, frames } = await connect(DEMO_TOKEN);
    ws.send(JSON.stringify({ type: "subscribe", topic: "providers/prv-paulo" }));
    ws.send(JSON.stringify({ type: "subscribe", topic: "requests" }));
    ws.send(JSON.stringify({ type: "ping" }));
    const repos = server.repositories;
    await repos.requests.create({ kind: "cargo", origin: places.ingombota, destination: places.talatona, clientId: "cli-armando" });
    await tick();
    expect(frames.find((f) => f.type === "error")).toMatchObject({ code: "forbidden" });
    expect(frames).toContainEqual({ type: "pong" });
    expect(frames.filter((f) => f.type === "event").map((f) => f.data?.client_id)).toEqual(["cli-armando"]);
  });

  it("a app recebe as alterações dos pedidos pelo WebSocket", async () => {
    const server = createMockServer(new MockDatabase());
    http.defaults.adapter = server.adapter;
    const realtime = new WebSocketRealtime({ url: "mock://realtime", token: () => DEMO_TOKEN, createSocket: server.connect });
    const repos = createApiRepositories({ realtime });
    const seen: string[] = [];
    const off = repos.requests.subscribe((r) => seen.push(r.status));
    await tick(20);
    setAuthTokens({ token: DEMO_TOKEN });
    const created = await repos.requests.create({ kind: "tow", origin: places.maianga, destination: places.talatona, clientId: "cli-armando" });
    await repos.requests.cancel(created.id, "Já resolvi");
    await tick(20);
    off();
    expect(seen).toEqual(["searching", "cancelled"]);
  });
});
