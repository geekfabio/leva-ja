import { RepositoryError } from "../repositories/types";

/**
 * Armazenamento cifrado no dispositivo (Keychain no iOS, Keystore no Android).
 * Espelha a API do `expo-secure-store` para a troca mock → dispositivo ser directa.
 */
export interface SecureStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  deleteItem(key: string): Promise<void>;
}

/** O `expo-secure-store` só aceita chaves com letras, números, ".", "-" e "_". */
const KEY_PATTERN = /^[\w.-]+$/;

/** Valores acima disto podem ser rejeitados por algumas versões do iOS. */
export const SECURE_VALUE_LIMIT = 2048;

export function assertSecureEntry(key: string, value?: string) {
  if (!KEY_PATTERN.test(key)) throw new RepositoryError("validation", `Chave inválida no armazenamento seguro: "${key}".`);
  if (value !== undefined && value.length > SECURE_VALUE_LIMIT) {
    throw new RepositoryError("validation", `Valor demasiado grande para o armazenamento seguro (${value.length} > ${SECURE_VALUE_LIMIT}).`);
  }
}
