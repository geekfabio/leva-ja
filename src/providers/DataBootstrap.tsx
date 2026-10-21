import { PropsWithChildren, useEffect } from "react";
import { repositories } from "@/data";
import { useAccountStore } from "@/stores/useAccountStore";
import { useProviderStore } from "@/stores/useProviderStore";
import { useServiceStore } from "@/stores/useServiceStore";
import { useSessionStore } from "@/stores/useSessionStore";

/**
 * Liga as stores aos repositórios: carrega os dados iniciais e mantém-nos em
 * dia com `subscribe` (no backend: WebSocket/push). Volta a carregar quando o
 * utilizador ou o prestador da sessão mudam.
 */
export function DataBootstrap({ children }: PropsWithChildren) {
  const userId = useSessionStore((s) => s.user.id);
  const providerId = useSessionStore((s) => s.providerId);

  // Retoma a sessão guardada no armazenamento seguro (uma vez, no arranque).
  useEffect(() => {
    useSessionStore.getState().restore();
  }, []);

  useEffect(() => {
    useServiceStore.getState().hydrate();
    return repositories().requests.subscribe((request) => useServiceStore.getState().upsert(request));
  }, [userId, providerId]);

  useEffect(() => {
    if (userId !== "guest") useAccountStore.getState().hydrate(userId);
  }, [userId]);

  useEffect(() => {
    if (providerId) useProviderStore.getState().hydrate(providerId);
  }, [providerId]);

  return children;
}
