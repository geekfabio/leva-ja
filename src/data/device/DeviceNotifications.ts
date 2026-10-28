import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { PushMessage } from "@/features/notifications/push";
import type { Unsubscribe } from "../repositories/types";

export type { PushMessage };

/**
 * Notificações push no dispositivo: autorização, token para o servidor e
 * mensagens recebidas. O que enviar é decidido pelo servidor.
 */
export interface DeviceNotifications {
  requestPermission(): Promise<boolean>;
  /** Token push do dispositivo, ou `null` (sem autorização, web ou sem projecto EAS). */
  pushToken(): Promise<string | null>;
  /** Mensagem recebida com a app aberta. */
  onMessage(listener: (message: PushMessage) => void): Unsubscribe;
  /** O utilizador tocou numa notificação (app em segundo plano ou fechada). */
  onOpen(listener: (message: PushMessage) => void): Unsubscribe;
}

const toMessage = (content: Notifications.NotificationContent): PushMessage => ({
  title: content.title ?? "AngoLeva",
  body: content.body ?? "",
  href: typeof content.data?.href === "string" ? content.data.href : undefined,
});

/** Implementação real sobre o expo-notifications (Expo Push → FCM/APNs). */
export class ExpoDeviceNotifications implements DeviceNotifications {
  constructor() {
    if (Platform.OS === "web") return;
    // Com a app aberta, a mensagem é mostrada pela própria app (onMessage), não pelo sistema.
    Notifications.setNotificationHandler({
      handleNotification: async () => ({ shouldShowBanner: false, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
    });
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("servicos", { name: "Estado dos serviços", importance: Notifications.AndroidImportance.HIGH }).catch(() => undefined);
    }
  }

  async requestPermission() {
    if (Platform.OS === "web") return false;
    try {
      const current = await Notifications.getPermissionsAsync();
      if (current.granted) return true;
      return (await Notifications.requestPermissionsAsync()).granted;
    } catch {
      return false;
    }
  }

  async pushToken() {
    if (Platform.OS === "web") return null;
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) {
      console.warn("Notificações: falta o projectId do EAS (app.json → extra.eas.projectId).");
      return null;
    }
    try {
      return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    } catch {
      return null;
    }
  }

  onMessage(listener: (message: PushMessage) => void): Unsubscribe {
    if (Platform.OS === "web") return () => undefined;
    const sub = Notifications.addNotificationReceivedListener((n) => listener(toMessage(n.request.content)));
    return () => sub.remove();
  }

  onOpen(listener: (message: PushMessage) => void): Unsubscribe {
    if (Platform.OS === "web") return () => undefined;
    const sub = Notifications.addNotificationResponseReceivedListener((r) => listener(toMessage(r.notification.request.content)));
    return () => sub.remove();
  }
}
