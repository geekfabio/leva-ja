import type { DeviceRegistration, NotificationRepository } from "../repositories/NotificationRepository";
import { db, type MockDatabase } from "./database";
import { simulate } from "./runtime";

/** Registo de dispositivos do backend simulado. O dono vem da sessão (ver server.ts). */
export class MockNotificationRepository implements NotificationRepository {
  constructor(private readonly database: MockDatabase = db) {}

  /** Na API simulada, o dono é preenchido a partir do token; aqui fica o registo base. */
  registerDevice(device: DeviceRegistration, owner: { userId: string; providerId?: string } = { userId: "anon" }) {
    return simulate(() => {
      this.database.devices.set(device.token, { ...owner, role: device.role, platform: device.platform });
    }, 0);
  }

  unregisterDevice(token: string) {
    return simulate(() => {
      this.database.devices.delete(token);
    }, 0);
  }
}
