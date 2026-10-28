import { Platform } from "react-native";
import { env, locationSource } from "@/config/env";
import type { Repositories } from "./repositories";
import { createApiRepositories } from "./api/ApiRepositories";
import { http, setAuthToken } from "./http/client";
import { createMockServer } from "./mock/server";
import { ExpoDeviceLocation, type DeviceLocation } from "./device/DeviceLocation";
import { SimulatedDeviceLocation } from "./mock/device";
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

function createRepositories(): Repositories {
  if (dataSource === "http") return createApiRepositories({ location });
  const server = createMockServer();
  http.defaults.adapter = server.adapter;
  return createApiRepositories({ realtime: server.socket, location });
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
