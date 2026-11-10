import { useEffect, useState } from "react";
import { usePathname } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import type { ServiceRequest, ServiceStatus } from "@/types/domain";
import { useAccountStore } from "@/stores/useAccountStore";
import { useRequest, useServiceStore } from "@/stores/useServiceStore";
import { repositories } from "@/data";
import { swap } from "@/features/navigation";
import { clientAutoAdvance, clientScreenFor } from "./stateMachine";

/** Pedido activo do cliente (o último criado ou aberto a partir do histórico). */
export function useActiveClientRequest() {
  const id = useServiceStore((s) => s.activeClientRequestId);
  return useRequest(id);
}

/**
 * Faz avançar sozinhos os estados que, com backend, chegariam por notificação
 * (prestador aceitou, chegou, entregou…). Desliga-se em Definições → Simulação,
 * para o fluxo poder ser conduzido pela área do prestador.
 */
export function useClientSimulation(request: ServiceRequest | undefined) {
  const autoAdvance = useAccountStore((s) => s.preferences.autoAdvance);
  const focused = useIsFocused();
  useEffect(() => {
    if (!request || !autoAdvance || !focused) return;
    const step = clientAutoAdvance[request.status];
    if (!step) return;
    const t = setTimeout(() => useServiceStore.getState().transition(request.id, step.to, "system"), step.afterMs);
    return () => clearTimeout(t);
  }, [request?.id, request?.status, autoAdvance, focused]);
}

/**
 * Enquanto o pedido estiver atribuído, lê periodicamente `request.provider.coords`
 * (posição real do prestador, devolvida pela API em cada pedido) para o
 * acompanhamento no mapa poder animar entre leituras sucessivas.
 */
export function useProviderLocationPolling(request: ServiceRequest | undefined, intervalMs = 3500) {
  const focused = useIsFocused();
  useEffect(() => {
    if (!request || !focused || !["assigned", "en_route"].includes(request.status)) return;
    const tick = () => {
      repositories()
        .requests.get(request.id)
        .then((r) => useServiceStore.getState().upsert(r))
        .catch(() => undefined);
    };
    const t = setInterval(tick, intervalMs);
    return () => clearInterval(t);
  }, [request?.id, request?.status, focused, intervalMs]);
}

/** Mantém o cliente no ecrã certo: se o estado mudar, troca para o ecrã correspondente. */
export function useStatusRoute(request: ServiceRequest | undefined, handles: ServiceStatus[]) {
  const path = usePathname();
  // Só o ecrã visível decide: ecrãs antigos na pilha não podem redireccionar.
  const focused = useIsFocused();
  useEffect(() => {
    if (!focused || !request || handles.includes(request.status)) return;
    const target = clientScreenFor[request.status];
    if (target !== path) swap(request.status === "cancelled" ? "/trips" : target);
  }, [request?.status, request, handles, path, focused]);
}

/** Progresso (0–1) de uma etapa com duração simulada, desde o momento em que o estado começou. */
export function useStageProgress(request: ServiceRequest | undefined, status: ServiceStatus, durationMs: number) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const started = [...(request?.timeline ?? [])].reverse().find((e) => e.status === status)?.at;
  if (!started) return 0;
  return Math.min(1, (now - new Date(started).getTime()) / durationMs);
}
