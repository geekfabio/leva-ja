import { useEffect } from "react";
import { Platform } from "react-native";
import { router } from "expo-router";
import { deviceNotifications, repositories } from "@/data";
import { toast } from "@/lib/toast";
import { useAccountStore } from "@/stores/useAccountStore";
import { useSessionStore } from "@/stores/useSessionStore";

const platform = Platform.OS === "android" || Platform.OS === "ios" ? Platform.OS : "web";

/**
 * Notificações push: com sessão, regista este dispositivo na API (POST /devices)
 * e anula o registo ao sair. As mensagens chegam do servidor; com a app aberta
 * aparecem como aviso no topo, e tocar numa notificação abre o ecrã indicado.
 */
export function usePushNotifications() {
  const token = useSessionStore((s) => s.token);
  const role = useSessionStore((s) => s.role) ?? "client";

  useEffect(() => {
    if (!token) return;
    const device = deviceNotifications();
    let registered: string | null = null;
    let cancelled = false;
    (async () => {
      if (!(await device.requestPermission())) return;
      const pushToken = await device.pushToken();
      if (!pushToken || cancelled) return;
      await repositories().notifications.registerDevice({ token: pushToken, platform, role });
      registered = pushToken;
    })().catch(() => undefined);
    return () => {
      cancelled = true;
      if (registered) repositories().notifications.unregisterDevice(registered).catch(() => undefined);
    };
  }, [token, role]);

  useEffect(() => {
    const device = deviceNotifications();
    const offMessage = device.onMessage((message) => {
      if (!useAccountStore.getState().preferences.notifications.serviceUpdates) return;
      toast.info({ title: message.title, message: message.body });
    });
    const offOpen = device.onOpen((message) => {
      if (message.href) router.push(message.href as never);
    });
    return () => {
      offMessage();
      offOpen();
    };
  }, []);
}
