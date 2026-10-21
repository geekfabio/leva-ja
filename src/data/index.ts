import type { Repositories } from "./repositories";
import { createHttpRepositories } from "./http/HttpRepositories";
import { createMockRepositories } from "./mock";
import { DEMO_CLIENT, DEMO_PROVIDER_ID } from "./mock/demo";

export * from "./repositories";
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
