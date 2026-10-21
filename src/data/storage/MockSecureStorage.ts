import { assertSecureEntry, type SecureStorage } from "./SecureStorage";

/**
 * SecureStore simulado em memória: mesmas regras de chave e tamanho do nativo,
 * operações assíncronas, sem cifra. Os dados duram enquanto a app estiver aberta.
 */
export class MockSecureStorage implements SecureStorage {
  private readonly entries = new Map<string, string>();

  async getItem(key: string) {
    assertSecureEntry(key);
    return this.entries.get(key) ?? null;
  }

  async setItem(key: string, value: string) {
    assertSecureEntry(key, value);
    this.entries.set(key, value);
  }

  async deleteItem(key: string) {
    assertSecureEntry(key);
    this.entries.delete(key);
  }

  /** Só para testes: chaves guardadas. */
  keys() {
    return [...this.entries.keys()];
  }

  clear() {
    this.entries.clear();
  }
}
