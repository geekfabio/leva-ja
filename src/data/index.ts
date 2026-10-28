import { Platform } from "react-native";
import { cameraSource, env, locationSource } from "@/config/env";
import type { Repositories } from "./repositories";
import { createApiRepositories } from "./api/ApiRepositories";
import { getAuthToken, http, setAuthToken } from "./http/client";
import { PollingRealtime, type RealtimeChannel } from "./api/realtime";
import { WebSocketRealtime } from "./api/WebSocketRealtime";
import { Emitter } from "./mock/events";
import { createMockServer } from "./mock/server";
import { ExpoDeviceLocation, type DeviceLocation } from "./device/DeviceLocation";
import { SimulatedDeviceLocation, SimulatedDeviceNotifications } from "./mock/device";
import { ExpoDeviceNotifications, type DeviceNotifications } from "./device/DeviceNotifications";
import { ExpoDeviceCamera } from "./device/DeviceCamera";
import { DEMO_CLIENT, DEMO_PROVIDER_ID, DEMO_TOKEN } from "./mock/demo";
import { DeviceSecureStorage } from "./storage/DeviceSecureStorage";
import { MockSecureStorage } from "./storage/MockSecureStorage";
import { SessionVault } from "./storage/SessionVault";
import type { SecureStorage } from "./storage/SecureStorage";

export * from "./repositories";
export * from "./storage";
export { configureMock, mockRuntime, resetMockDatabase, simulatedProviderFor } from "./mock";
export { onTokensRefreshed, onUnauthorized, setAuthTokens } from "./http/client";

/**
 * Origem dos dados (src/config/env.ts). Em ambos os casos a app usa os mesmos
 * repositórios da API (`createApiRepositories`): os dados chegam sempre no
 * formato da API e passam pelos mesmos mappers.
 * - `mock` (por omissão): API simulada dentro da app, sobre a base mock,
 *   com tempo real por socket simulado;
 * - `http`: API real em EXPO_PUBLIC_API_URL, com tempo real por polling.
 */
export const dataSource = env.dataSource;

/** Funcionalidades do dispositivo (GPS). */
const location: DeviceLocation = locationSource === "device" ? new ExpoDeviceLocation() : new SimulatedDeviceLocation();
export const deviceLocation = () => location;
const camera = cameraSource === "device" ? new ExpoDeviceCamera() : undefined;

/** Que funcionalidades do dispositivo são reais e quais são simuladas. */
export const deviceFeatures = { camera: cameraSource, location: locationSource, notifications: dataSource === "http" ? "device" : "simulated" } as const;

/**
 * Push: com a API real, Expo Push; com a API simulada, o serviço de entrega
 * dela (o servidor simulado não consegue enviar para um telemóvel real).
 */
let notifications: DeviceNotifications;
export const deviceNotifications = () => notifications;

const reconnects = new Emitter<void>();
/** Avisa quando o tempo real volta depois de uma quebra (podem ter-se perdido eventos). */
export const onRealtimeReconnect = (listener: () => void) => reconnects.on("reconnect", listener);
const onReconnect = () => reconnects.emit("reconnect", undefined);

/** Tempo real: WebSocket quando há URL (com recurso ao polling), senão polling. */
function realtimeChannel(): RealtimeChannel {
  const polling = new PollingRealtime(env.pollIntervalMs);
  if (!env.realtimeUrl) return polling;
  return new WebSocketRealtime({ url: env.realtimeUrl, token: getAuthToken, fallback: polling, onReconnect });
}

function createRepositories(): Repositories {
  if (dataSource === "http") {
    notifications = new ExpoDeviceNotifications();
    return createApiRepositories({ realtime: realtimeChannel(), location, camera });
  }
  const server = createMockServer();
  http.defaults.adapter = server.adapter;
  notifications = new SimulatedDeviceNotifications(server.pushGateway);
  // A API simulada fala o mesmo protocolo WebSocket que o backend vai falar.
  const realtime = new WebSocketRealtime({ url: "mock://realtime", token: getAuthToken, createSocket: server.connect, onReconnect });
  return createApiRepositories({ realtime, location, camera });
}

let current: Repositories = createRepositories();

/** Repositórios activos. Stores e hooks nunca importam mocks directamente. */
export const repositories = (): Repositories => current;

/** Substitui os repositórios (testes ou troca de ambiente). */
export function setRepositories(next: Repositories) {
  current = next;
}

/** Sessão de demonstração (só na API simulada): permite abrir qualquer ecrã sem login. */
export const demoIdentity = dataSource === "mock" ? { user: DEMO_CLIENT, providerId: DEMO_PROVIDER_ID, token: DEMO_TOKEN } : undefined;
if (demoIdentity) setAuthToken(demoIdentity.token);

/**
 * Armazenamento seguro: `mock` (memória, por omissão nesta fase) ou `device`
 * (expo-secure-store). Definir EXPO_PUBLIC_SECURE_STORAGE=device para usar o
 * Keychain/Keystore. A web não tem SecureStore e fica sempre com o mock.
 */
export const secureStorageSource: "mock" | "device" = env.secureStorage === "device" && Platform.OS !== "web" ? "device" : "mock";

let storage: SecureStorage = secureStorageSource === "device" ? new DeviceSecureStorage() : new MockSecureStorage();
let vault = new SessionVault(storage);

/** Sessão guardada no armazenamento seguro. */
export const sessionVault = () => vault;

/** Substitui o armazenamento seguro (testes). */
export function setSecureStorage(next: SecureStorage) {
  storage = next;
  vault = new SessionVault(next);
}
