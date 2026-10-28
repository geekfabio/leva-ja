import type { z } from "zod";
import { RepositoryError } from "../repositories/types";

/** Valida uma resposta; um formato inesperado é um erro do servidor, não dados errados no ecrã. */
export function parse<S extends z.ZodTypeAny>(schema: S, payload: unknown, what: string): z.infer<S> {
  const result = schema.safeParse(payload);
  if (result.success) return result.data;
  if (process.env.NODE_ENV !== "test") console.warn(`Resposta da API fora do contrato (${what}):`, result.error.issues.slice(0, 5));
  throw new RepositoryError("server", "Resposta inesperada do servidor.");
}
