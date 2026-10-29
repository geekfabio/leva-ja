import type { Role } from "@/types/domain";

export type DeviceRegistration = { token: string; platform: "android" | "ios" | "web"; role: Role };

/** Registo do dispositivo para notificações push (o servidor decide o que enviar). */
export interface NotificationRepository {
  registerDevice(device: DeviceRegistration): Promise<void>;
  unregisterDevice(token: string): Promise<void>;
}
