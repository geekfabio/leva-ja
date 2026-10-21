import { Platform } from "react-native";
import type { Repositories } from "./repositories";
import { createHttpRepositories } from "./http/HttpRepositories";
import { createMockRepositories } from "./mock";
import { DEMO_CLIENT, DEMO_PROVIDER_ID } from "./mock/demo";
import { DeviceSecureStorage } from "./storage/DeviceSecureStorage";
import { MockSecureStorage } from "./storage/MockSecureStorage";
import { SessionVault } from "./storage/SessionVault";
import type { SecureStorage } from "./storage/SecureStorage";

export * from "./repositories";
export * from "./storage";
export { configureMock, mockRuntime, resetMockDatabase, simulatedProviderFor } from "./mock";

/**
 * Origem dos dados: `mock` (por omissão nesta fase) ou `http`.
 * Definir EXPO_PUBLIC_DATA_SOURCE=http para usar a API em EXPO_PUBLIC_API_URL.
 */
export const dataSource: "mock" | "http" = process.env.EXPO_PUBLIC_DATA_SOURCE === "http" ? "http" : "mock";

let current: Repositories = dataSource === "http" ? createHttpRepositories() : createMockRepositories();

/** Repositórios activos. Stores e hooks nunca importam mocks directamente. */
export const repositories = (): Repositories => current;

/** Substitui os repositórios (testes ou troca de ambiente). */
export function setRepositories(next: Repositories) {
  current = next;
}

/** Sessão de demonstração (só em modo mock): permite abrir qualquer ecrã sem login. */
export const demoIdentity = dataSource === "mock" ? { user: DEMO_CLIENT, providerId: DEMO_PROVIDER_ID } : undefined;

/**
 * Armazenamento seguro: `mock` (memória, por omissão nesta fase) ou `device`
 * (expo-secure-store). Definir EXPO_PUBLIC_SECURE_STORAGE=device para usar o
 * Keychain/Keystore. A web não tem SecureStore e fica sempre com o mock.
 */
export const secureStorageSource: "mock" | "device" = process.env.EXPO_PUBLIC_SECURE_STORAGE === "device" && Platform.OS !== "web" ? "device" : "mock";

let storage: SecureStorage = secureStorageSource === "device" ? new DeviceSecureStorage() : new MockSecureStorage();
let vault = new SessionVault(storage);

/** Sessão guardada no armazenamento seguro. */
export const sessionVault = () => vault;

/** Substitui o armazenamento seguro (testes). */
export function setSecureStorage(next: SecureStorage) {
  storage = next;
  vault = new SessionVault(next);
}
