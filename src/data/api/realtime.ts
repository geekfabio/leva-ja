import type { Unsubscribe } from "../repositories/types";
import { call, http } from "../http/client";

/**
 * Canal de tempo real da API. Os tópicos e as mensagens (JSON no formato da
 * API) são os mesmos qualquer que seja o transporte:
 *
 * - `requests`            → ServiceRequestDto alterado
 * - `providers/<id>`      → ProviderStateDto
 * - `threads/<id>`        → ChatEventDto (mensagem ou "a escrever…")
 *
 * Transportes: `PollingRealtime` (API REST de hoje) e o socket da API
 * simulada (`src/data/mock/server.ts`), que se comporta como o futuro WebSocket.
 */
export interface RealtimeChannel {
  subscribe(topic: string, handler: (payload: unknown) => void): Unsubscribe;
}

type ChangesBody = { data: unknown[]; meta: { cursor: string } };

/**
 * Pede `path?since=<cursor>` em ciclo. O primeiro pedido (sem cursor) só fixa o
 * ponto de partida; a partir daí cada alteração é entregue uma vez.
 */
function pollChanges(path: string, handler: (item: unknown) => void, ms: number): Unsubscribe {
  let cursor: string | undefined;
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const tick = async () => {
    try {
      const page = await call(http.get<ChangesBody>(path, { params: cursor ? { since: cursor } : undefined }));
      if (stopped) return;
      if (cursor !== undefined) page.data.forEach(handler);
      cursor = page.meta.cursor;
    } catch {
      // Falhas no polling são silenciosas; o próximo ciclo tenta de novo.
    }
    if (!stopped) timer = setTimeout(tick, ms);
  };
  tick();
  return () => {
    stopped = true;
    clearTimeout(timer);
  };
}

/** Pede o mesmo recurso em ciclo e só avisa quando muda. */
function pollValue(path: string, handler: (value: unknown) => void, ms: number): Unsubscribe {
  let last: string | undefined;
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const tick = async () => {
    try {
      const body = await call(http.get<{ data: unknown }>(path));
      const serialized = JSON.stringify(body.data);
      if (!stopped && last !== undefined && serialized !== last) handler(body.data);
      last = serialized;
    } catch {
      // idem
    }
    if (!stopped) timer = setTimeout(tick, ms);
  };
  tick();
  return () => {
    stopped = true;
    clearTimeout(timer);
  };
}

/** Tempo real sobre REST, até o backend ter WebSocket. Sem "a escrever…". */
export class PollingRealtime implements RealtimeChannel {
  constructor(private readonly intervalMs: number) {}

  subscribe(topic: string, handler: (payload: unknown) => void): Unsubscribe {
    if (topic === "requests") return pollChanges("/requests/changes", handler, this.intervalMs);
    const [kind, id] = topic.split("/");
    if (kind === "providers" && id) return pollValue(`/providers/${id}/state`, handler, this.intervalMs);
    if (kind === "threads" && id) return pollChanges(`/threads/${id}/changes`, (message) => handler({ type: "message", message }), this.intervalMs);
    throw new Error(`Tópico de tempo real desconhecido: ${topic}`);
  }
}
