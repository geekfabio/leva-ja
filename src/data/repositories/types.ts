/** Função devolvida por `subscribe` para cancelar a subscrição. */
export type Unsubscribe = () => void;

export type RepositoryErrorCode =
  | "network"
  | "not_found"
  | "invalid_transition"
  | "forbidden"
  | "validation"
  | "unauthorized";

/** Erro de domínio devolvido por qualquer implementação (mock ou HTTP). */
export class RepositoryError extends Error {
  constructor(
    public readonly code: RepositoryErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "RepositoryError";
  }
}

export const isRepositoryError = (e: unknown): e is RepositoryError => e instanceof RepositoryError;
