import { createApiRepositories } from "@/data/api/ApiRepositories";
import { http } from "@/data/http/client";
import { MockDatabase } from "@/data/mock/database";
import { SimulatedDeviceNotifications } from "@/data/mock/device";
import { createMockServer } from "@/data/mock/server";
import { places } from "@/mocks/places";
import type { PushMessage } from "@/features/notifications/push";

jest.mock("expo-notifications", () => ({
  AndroidImportance: { HIGH: 4 },
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(async () => undefined),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
}));
jest.mock("expo-constants", () => ({ __esModule: true, default: { expoConfig: { extra: {} } } }));

async function setup() {
  const server = createMockServer(new MockDatabase());
  http.defaults.adapter = server.adapter;
  const repos = createApiRepositories({ realtime: server.socket });
  const device = new SimulatedDeviceNotifications(server.pushGateway);
  const received: PushMessage[] = [];
  device.onMessage((m) => received.push(m));
  return { repos, device, received };
}

describe("notificações push (servidor simulado)", () => {
  it("o cliente regista o dispositivo e recebe as mudanças de estado do seu pedido", async () => {
    const { repos, device, received } = await setup();
    await repos.auth.login("armando@email.com", "segredo12", "client");
    await repos.notifications.registerDevice({ token: (await device.pushToken())!, platform: "ios", role: "client" });

    const created = await repos.requests.create({ kind: "cargo", origin: places.ingombota, destination: places.talatona, clientId: "cli-armando" });
    await repos.requests.transition(created.id, "assigned", "system");
    expect(received).toEqual([expect.objectContaining({ title: "Prestador encontrado", href: expect.any(String) })]);

    await repos.notifications.unregisterDevice((await device.pushToken())!);
    await repos.requests.transition(created.id, "en_route", "system");
    expect(received).toHaveLength(1);
  });

  it("o prestador é avisado quando o cliente confirma a recolha", async () => {
    const { repos, device, received } = await setup();
    await repos.auth.login("joao.manuel@angoleva.ao", "segredo12", "provider");
    await repos.notifications.registerDevice({ token: (await device.pushToken())!, platform: "android", role: "provider" });
    const created = await repos.requests.create({ kind: "cargo", origin: places.ingombota, destination: places.talatona, clientId: "cli-armando" });
    await repos.requests.accept(created.id, "prv-joao");
    for (const to of ["en_route", "arrived"] as const) await repos.requests.transition(created.id, to, "provider");
    await repos.requests.transition(created.id, "pickup_confirmed", "client");
    expect(received.map((m) => m.title)).toEqual(["Recolha confirmada"]);
  });

  it("não se pode anular o registo do dispositivo de outra pessoa", async () => {
    const { repos } = await setup();
    await repos.auth.login("armando@email.com", "segredo12", "client");
    await repos.notifications.registerDevice({ token: "sim-push-do-armando", platform: "ios", role: "client" });
    await repos.auth.login("carlos.mendes@email.com", "segredo12", "client");
    await expect(repos.notifications.unregisterDevice("sim-push-do-armando")).rejects.toMatchObject({ code: "forbidden" });
  });
});

describe("ExpoDeviceNotifications (expo-notifications)", () => {
  let ExpoDeviceNotifications: typeof import("@/data/device/DeviceNotifications").ExpoDeviceNotifications;
  let notifications: jest.Mocked<typeof import("expo-notifications")>;
  let constants: { default: { expoConfig: { extra: Record<string, unknown> } } };
  beforeEach(() => {
    jest.isolateModules(() => {
      ExpoDeviceNotifications = require("@/data/device/DeviceNotifications").ExpoDeviceNotifications;
      notifications = require("expo-notifications");
      constants = require("expo-constants");
    });
  });

  it("pede autorização só se ainda não existir", async () => {
    notifications.getPermissionsAsync.mockResolvedValue({ granted: false } as never);
    notifications.requestPermissionsAsync.mockResolvedValue({ granted: true } as never);
    expect(await new ExpoDeviceNotifications().requestPermission()).toBe(true);
    expect(notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it("sem projectId do EAS não há token; com ele, devolve o token Expo", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
    expect(await new ExpoDeviceNotifications().pushToken()).toBeNull();
    warn.mockRestore();
    constants.default.expoConfig.extra = { eas: { projectId: "proj-123" } };
    notifications.getExpoPushTokenAsync.mockResolvedValue({ data: "ExponentPushToken[abc]" } as never);
    expect(await new ExpoDeviceNotifications().pushToken()).toBe("ExponentPushToken[abc]");
    expect(notifications.getExpoPushTokenAsync).toHaveBeenCalledWith({ projectId: "proj-123" });
  });
});
