import { useCallback, useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import type { Negotiation } from "@/types/domain";
import { repositories } from "@/data";
import { useServiceStore } from "@/stores/useServiceStore";

type Options = { pollMs?: number; active?: boolean };

/**
 * Negociações de um pedido: o cliente vê todas as abertas por diferentes
 * prestadores; um prestador só vê a sua própria (o servidor filtra). Faz
 * poll enquanto o ecrã estiver focado e `active` for verdadeiro.
 */
export function useRequestNegotiations(requestId: string | undefined, { pollMs = 3000, active = true }: Options = {}) {
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [loaded, setLoaded] = useState(false);
  const focused = useIsFocused();

  const reload = useCallback(async () => {
    if (!requestId) return;
    try {
      setNegotiations(await repositories().requests.negotiations(requestId));
    } finally {
      setLoaded(true);
    }
  }, [requestId]);

  useEffect(() => {
    if (!requestId || !focused || !active) return;
    reload();
    const t = setInterval(reload, pollMs);
    return () => clearInterval(t);
  }, [requestId, focused, active, pollMs, reload]);

  return { negotiations, loaded, reload };
}

/** Acções de negociação: ajustar, aceitar e recusar, com o estado de "a decorrer" de cada uma. */
export function useNegotiationActions(requestId: string, reload: () => void | Promise<void>) {
  const [pendingKey, setPendingKey] = useState<string | null>(null);

  const run = useCallback(
    async (key: string, action: () => Promise<unknown>) => {
      setPendingKey(key);
      try {
        await action();
        await reload();
        return true;
      } catch {
        return false;
      } finally {
        setPendingKey(null);
      }
    },
    [reload],
  );

  return {
    pendingKey,
    open: (direction: "up" | "down") => run("open", () => repositories().requests.openNegotiation(requestId, direction)),
    adjust: (negotiationId: string, direction: "up" | "down") =>
      run(`adjust-${negotiationId}`, () => repositories().requests.adjustNegotiation(requestId, negotiationId, direction)),
    accept: (negotiationId: string) =>
      run(`accept-${negotiationId}`, async () => useServiceStore.getState().upsert(await repositories().requests.acceptNegotiation(requestId, negotiationId))),
    decline: (negotiationId: string) => run(`decline-${negotiationId}`, () => repositories().requests.declineNegotiation(requestId, negotiationId)),
  };
}
