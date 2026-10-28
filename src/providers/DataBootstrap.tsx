import { PropsWithChildren, useEffect } from "react";
import { router } from "expo-router";
import { onUnauthorized, repositories } from "@/data";
import { toast } from "@/lib/toast";
import { usePushNotifications } from "@/features/notifications/usePushNotifications";
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
  usePushNotifications();

  // Retoma a sessão guardada no armazenamento seguro (uma vez, no arranque).
  useEffect(() => {
    useSessionStore.getState().restore();
  }, []);

  // Token recusado pela API (expirado ou revogado): volta ao login.
  useEffect(
    () =>
      onUnauthorized(() => {
        if (!useSessionStore.getState().authenticated) return;
        useSessionStore.getState().expire();
        toast.info({ title: "Sessão expirada", message: "Entra de novo para continuar." });
        router.replace("/login" as never);
      }),
    [],
  );

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
