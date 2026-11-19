import { assertSecureEntry, type SecureStorage } from "./SecureStorage";

/**
 * Armazenamento da sessão no browser (`localStorage`), onde não há Keychain nem
 * Keystore. As mesmas regras de chave e tamanho do nativo; não é cifrado, por
 * isso só serve para a versão web da app.
 */
export class WebSecureStorage implements SecureStorage {
  async getItem(key: string) {
    assertSecureEntry(key);
    return globalThis.localStorage?.getItem(key) ?? null;
  }

  async setItem(key: string, value: string) {
    assertSecureEntry(key, value);
    globalThis.localStorage?.setItem(key, value);
  }

  async deleteItem(key: string) {
    assertSecureEntry(key);
    globalThis.localStorage?.removeItem(key);
  }
}
