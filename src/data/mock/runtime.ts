import { RepositoryError } from "../repositories/types";

/** Comportamento da "rede" simulada. Os testes põem a latência a zero. */
export const mockRuntime = {
  latencyMs: 350,
  failNetwork: false,
};

export function configureMock(options: Partial<typeof mockRuntime>) {
  Object.assign(mockRuntime, options);
}

/** Executa uma operação da base mock com latência e, se configurado, falha de rede. */
export async function simulate<T>(operation: () => T, latencyMs = mockRuntime.latencyMs): Promise<T> {
  if (latencyMs > 0) await new Promise((resolve) => setTimeout(resolve, latencyMs));
  if (mockRuntime.failNetwork) throw new RepositoryError("network", "Sem ligação ao servidor (simulado).");
  return operation();
}

/** Cópia profunda: o que sai da base mock nunca partilha referências com o que fica lá. */
export const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

/** Agenda um efeito "do servidor" (validações, respostas, transferências). */
export function later(ms: number, effect: () => void) {
  return setTimeout(effect, mockRuntime.latencyMs === 0 ? Math.min(ms, 10) : ms);
}
