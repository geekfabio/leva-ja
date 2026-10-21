import { useEffect, useState } from "react";
import { usePathname } from "expo-router";
import { useIsFocused } from "@react-navigation/native";
import type { ServiceRequest, ServiceStatus } from "@/types/domain";
import { useAccountStore } from "@/stores/useAccountStore";
import { simulatedProviderFor, useRequest, useServiceStore } from "@/stores/useServiceStore";
import { swap } from "@/features/navigation";
import { needsProposal } from "@/features/booking/pricing";
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
    // Mudança de casa: o prestador simulado envia uma proposta em vez de aceitar logo.
    if (request.status === "searching" && needsProposal(request.kind)) {
      if (request.proposal?.status === "sent") return;
      const t = setTimeout(() => {
        const amount = Math.round((request.price.total - request.price.platformFee + 3500) / 500) * 500;
        useServiceStore.getState().submitProposal(request.id, amount, "Inclui 2 ajudantes, protecção dos móveis e escadas sem elevador.", simulatedProviderFor(request.kind));
      }, step.afterMs);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => useServiceStore.getState().transition(request.id, step.to, "system"), step.afterMs);
    return () => clearTimeout(t);
  }, [request?.id, request?.status, request?.proposal?.status, autoAdvance, focused, request]);
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
