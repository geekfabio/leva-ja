import { configureMock } from "@/data";

// O expo-notifications avisa ao ser importado fora de uma build nativa; nos testes não há push real
// (notifications.test.ts tem o seu próprio mock).
jest.mock("expo-notifications", () => ({
  AndroidImportance: { HIGH: 4 },
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(async () => undefined),
  getPermissionsAsync: jest.fn(async () => ({ granted: false })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: false })),
  getExpoPushTokenAsync: jest.fn(async () => ({ data: "" })),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
}));

// Nos testes, os repositórios mock respondem sem latência.
configureMock({ latencyMs: 0, failNetwork: false });
