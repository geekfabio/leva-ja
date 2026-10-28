import type { Unsubscribe } from "../repositories/types";
import { onTokensRefreshed } from "../http/client";
import type { RealtimeChannel } from "./realtime";

/**
 * Protocolo do canal de tempo real (JSON, uma mensagem por frame):
 *
 * app → servidor   { type: "auth", token } · { type: "subscribe", topic } · { type: "unsubscribe", topic } · { type: "ping" }
 * servidor → app   { type: "event", topic, data } · { type: "pong" } · { type: "error", code, message }
 *
 * Tópicos e `data` são os mesmos do polling (ver realtime.ts e docs/api.md).
 */
export type ClientFrame = { type: "auth"; token: string } | { type: "subscribe" | "unsubscribe"; topic: string } | { type: "ping" };
export type ServerFrame = { type: "event"; topic: string; data: unknown } | { type: "pong" } | { type: "error"; code: string; message: string };

/** O mínimo de um WebSocket de que o canal precisa (o do React Native ou um falso, nos testes e na API simulada). */
export type SocketLike = {
  send(data: string): void;
  close(): void;
  onopen: (() => void) | null;
  onmessage: ((event: { data: unknown }) => void) | null;
  onclose: (() => void) | null;
  onerror: (() => void) | null;
};

export type WebSocketRealtimeOptions = {
  url: string;
  /** Token de acesso actual. */
  token: () => string | null;
  createSocket?: (url: string) => SocketLike;
  /** Canal a usar se o WebSocket nunca chegar a abrir (ex.: rede que bloqueia WebSockets). */
  fallback?: RealtimeChannel;
  /** Falhas seguidas sem nunca abrir antes de passar ao fallback. */
  maxFailures?: number;
  heartbeatMs?: number;
  /** Chamado depois de cada reconexão: podem ter-se perdido eventos, convém recarregar. */
  onReconnect?: () => void;
};

type Handler = (payload: unknown) => void;

const BACKOFF_MAX_MS = 30_000;

/** Temporizadores que não impedem o processo de terminar (Node/testes); no React Native não há `unref`. */
const background = <T>(timer: T) => {
  (timer as { unref?: () => void }).unref?.();
  return timer;
};

/** Tempo real por WebSocket, com reconexão exponencial, re-subscrição e recurso ao polling. */
export class WebSocketRealtime implements RealtimeChannel {
  private readonly handlers = new Map<string, Set<Handler>>();
  private readonly fallbackSubs = new Map<Handler, Unsubscribe>();
  private socket?: SocketLike;
  private open = false;
  private everOpened = false;
  private degraded = false;
  private failures = 0;
  private reconnectTimer?: ReturnType<typeof setTimeout>;
  private heartbeat?: ReturnType<typeof setInterval>;

  constructor(private readonly options: WebSocketRealtimeOptions) {
    // Token renovado: autentica de novo a ligação aberta.
    onTokensRefreshed(({ token }) => this.open && this.send({ type: "auth", token }));
  }

  /** Estado, para diagnóstico e testes. */
  get state() {
    return this.degraded ? "fallback" : this.open ? "open" : this.socket ? "connecting" : "idle";
  }

  subscribe(topic: string, handler: Handler): Unsubscribe {
    if (this.degraded && this.options.fallback) return this.viaFallback(topic, handler);
    let set = this.handlers.get(topic);
    if (!set) {
      set = new Set();
      this.handlers.set(topic, set);
      if (this.open) this.send({ type: "subscribe", topic });
    }
    set.add(handler);
    this.connect();
    return () => {
      const current = this.handlers.get(topic);
      if (!current) return this.fallbackSubs.get(handler)?.();
      current.delete(handler);
      if (current.size) return;
      this.handlers.delete(topic);
      if (this.open) this.send({ type: "unsubscribe", topic });
      if (!this.handlers.size) this.disconnect();
    };
  }

  private viaFallback(topic: string, handler: Handler): Unsubscribe {
    const off = this.options.fallback!.subscribe(topic, handler);
    this.fallbackSubs.set(handler, off);
    return () => {
      off();
      this.fallbackSubs.delete(handler);
    };
  }

  private send(frame: ClientFrame) {
    try {
      this.socket?.send(JSON.stringify(frame));
    } catch {
      // A ligação caiu entretanto; o onclose trata da reconexão.
    }
  }

  private connect() {
    if (this.socket || this.degraded) return;
    clearTimeout(this.reconnectTimer);
    const create = this.options.createSocket ?? ((url: string) => new WebSocket(url) as unknown as SocketLike);
    let socket: SocketLike;
    try {
      socket = create(this.options.url);
    } catch {
      this.scheduleReconnect();
      return;
    }
    this.socket = socket;
    // Eventos de uma ligação já substituída (fechada por nós) são ignorados.
    const current = () => this.socket === socket;
    socket.onopen = () => {
      if (!current()) return;
      this.open = true;
      this.failures = 0;
      const token = this.options.token();
      if (token) this.send({ type: "auth", token });
      this.handlers.forEach((_, topic) => this.send({ type: "subscribe", topic }));
      if (this.everOpened) this.options.onReconnect?.();
      this.everOpened = true;
      this.heartbeat = background(setInterval(() => this.send({ type: "ping" }), this.options.heartbeatMs ?? 25_000));
    };
    socket.onmessage = (event) => {
      if (!current()) return;
      let frame: ServerFrame;
      try {
        frame = JSON.parse(String(event.data)) as ServerFrame;
      } catch {
        return;
      }
      if (frame.type === "event") this.handlers.get(frame.topic)?.forEach((handler) => handler(frame.data));
    };
    socket.onerror = () => undefined;
    socket.onclose = () => {
      if (!current()) return;
      this.open = false;
      this.socket = undefined;
      clearInterval(this.heartbeat);
      if (!this.handlers.size) return;
      this.failures += 1;
      if (!this.everOpened && this.options.fallback && this.failures >= (this.options.maxFailures ?? 3)) return this.degrade();
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect() {
    const delay = Math.min(BACKOFF_MAX_MS, 1000 * 2 ** Math.max(0, this.failures - 1));
    this.reconnectTimer = background(setTimeout(() => this.connect(), delay));
  }

  /** O WebSocket não funciona nesta rede: todos os tópicos passam para o polling. */
  private degrade() {
    this.degraded = true;
    const topics = [...this.handlers];
    this.handlers.clear();
    for (const [topic, set] of topics) set.forEach((handler) => this.viaFallback(topic, handler));
  }

  private disconnect() {
    clearTimeout(this.reconnectTimer);
    clearInterval(this.heartbeat);
    const socket = this.socket;
    this.socket = undefined;
    this.open = false;
    socket?.close();
  }
}
