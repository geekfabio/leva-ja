import type { Unsubscribe } from "../repositories/types";

/** Emissor mínimo por tópico, usado para simular o tempo real (WebSocket/push). */
export class Emitter<T> {
  private listeners = new Map<string, Set<(payload: T) => void>>();

  on(topic: string, listener: (payload: T) => void): Unsubscribe {
    const set = this.listeners.get(topic) ?? new Set();
    set.add(listener);
    this.listeners.set(topic, set);
    return () => set.delete(listener);
  }

  emit(topic: string, payload: T) {
    this.listeners.get(topic)?.forEach((listener) => listener(payload));
  }
}
