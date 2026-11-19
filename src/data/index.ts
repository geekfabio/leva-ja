import { Platform } from "react-native";
import { env } from "@/config/env";
import type { Repositories } from "./repositories";
import { createApiRepositories } from "./api/ApiRepositories";
import { getAuthToken } from "./http/client";
import { PollingRealtime, type RealtimeChannel } from "./api/realtime";
import { WebSocketRealtime } from "./api/WebSocketRealtime";
import { Emitter } from "./events";
import { ExpoDeviceLocation, type DeviceLocation } from "./device/DeviceLocation";
import { ExpoDeviceNotifications, type DeviceNotifications } from "./device/DeviceNotifications";
import { ExpoDeviceCamera } from "./device/DeviceCamera";
import { DeviceSecureStorage } from "./storage/DeviceSecureStorage";
import { WebSecureStorage } from "./storage/WebSecureStorage";
import { SessionVault } from "./storage/SessionVault";
import type { SecureStorage } from "./storage/SecureStorage";

export * from "./repositories";
export * from "./storage";
export { onTokensRefreshed, onUnauthorized, setAuthTokens } from "./http/client";

/**
 * A app fala sempre com a API real (`EXPO_PUBLIC_API_URL`, ver src/config/env.ts).
 * GPS, câmara e push são os do dispositivo. Só os testes trocam estas peças,
 * através dos `set*` abaixo (ver src/__test-support__/bootstrap.ts).
 */
let location: DeviceLocation = new ExpoDeviceLocation();
export const deviceLocation = () => location;
export function setDeviceLocation(next: DeviceLocation) {
  location = next;
}

let notifications: DeviceNotifications = new ExpoDeviceNotifications();
export const deviceNotifications = () => notifications;
export function setDeviceNotifications(next: DeviceNotifications) {
  notifications = next;
}

const reconnects = new Emitter<void>();
/** Avisa quando o tempo real volta depois de uma quebra (podem ter-se perdido eventos). */
export const onRealtimeReconnect = (listener: () => void) => reconnects.on("reconnect", listener);
export const notifyRealtimeReconnect = () => reconnects.emit("reconnect", undefined);

/** Tempo real: WebSocket quando há URL (com recurso ao polling), senão polling. */
function realtimeChannel(): RealtimeChannel {
  const polling = new PollingRealtime(env.pollIntervalMs);
  if (!env.realtimeUrl) return polling;
  return new WebSocketRealtime({ url: env.realtimeUrl, token: getAuthToken, fallback: polling, onReconnect: notifyRealtimeReconnect });
}

let current: Repositories = createApiRepositories({ realtime: realtimeChannel(), location, camera: new ExpoDeviceCamera() });

/** Repositórios activos. Stores e hooks nunca importam mocks directamente. */
export const repositories = (): Repositories => current;

/** Substitui os repositórios (testes). */
export function setRepositories(next: Repositories) {
  current = next;
}

/** Keychain/Keystore no telemóvel; na web não existem, e a sessão fica em `localStorage`. */
let storage: SecureStorage = Platform.OS === "web" ? new WebSecureStorage() : new DeviceSecureStorage();
let vault = new SessionVault(storage);

/** Sessão guardada no armazenamento seguro. */
export const sessionVault = () => vault;

/** Substitui o armazenamento seguro (testes). */
export function setSecureStorage(next: SecureStorage) {
  storage = next;
  vault = new SessionVault(next);
}
