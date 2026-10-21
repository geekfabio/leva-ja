import { useAccountStore } from "@/stores/useAccountStore";

export class MockNetworkError extends Error {
  constructor() {
    super("Sem ligação ao servidor (simulado).");
  }
}

/**
 * Simula a latência e as falhas de uma API. Quando houver backend, cada função
 * em `src/services/api` passa a chamar o cliente HTTP (`src/services/http.ts`)
 * mantendo a mesma assinatura, e os hooks de TanStack Query ficam iguais.
 */
export async function mockRequest<T>(resolve: () => T, latencyMs = 450): Promise<T> {
  await new Promise((r) => setTimeout(r, latencyMs));
  if (useAccountStore.getState().preferences.simulateNetworkErrors) throw new MockNetworkError();
  return resolve();
}
