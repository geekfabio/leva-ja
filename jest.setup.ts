import { installTestBackend } from "@/__test-support__/bootstrap";
import { configureMock } from "@/__test-support__/mock";

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

// Os testes não saem para a rede: a rota por estrada (OSRM) é a linha recta entre os dois pontos.
jest.mock("@/data/routing", () => ({
  fetchRoute: async (from: { latitude: number; longitude: number }, to: { latitude: number; longitude: number }) => ({ points: [from, to], distanceKm: 5, durationMin: 12, approximate: true }),
}));

// Nos testes, os repositórios mock respondem sem latência.
configureMock({ latencyMs: 0, failNetwork: false });
installTestBackend();
