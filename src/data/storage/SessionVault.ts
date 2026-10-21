import type { Role } from "@/types/domain";
import type { SecureStorage } from "./SecureStorage";

/** O que fica guardado no dispositivo: só o token e o perfil, nunca dados pessoais. */
export type StoredSession = { token: string; role: Role };

const SESSION_KEY = "levaja.session";
const ONBOARDED_KEY = "levaja.onboarded";

const isStoredSession = (value: unknown): value is StoredSession =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as StoredSession).token === "string" &&
  ((value as StoredSession).role === "client" || (value as StoredSession).role === "provider");

/** Leitura e escrita da sessão no armazenamento seguro. */
export class SessionVault {
  constructor(private readonly storage: SecureStorage) {}

  /** Sessão guardada, ou `null` se não houver ou estiver corrompida (nesse caso é apagada). */
  async load(): Promise<StoredSession | null> {
    const raw = await this.storage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      const parsed: unknown = JSON.parse(raw);
      if (isStoredSession(parsed)) return parsed;
    } catch {
      // cai para a limpeza abaixo
    }
    await this.clear();
    return null;
  }

  save(session: StoredSession) {
    return this.storage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  clear() {
    return this.storage.deleteItem(SESSION_KEY);
  }

  async hasOnboarded() {
    return (await this.storage.getItem(ONBOARDED_KEY)) === "1";
  }

  markOnboarded() {
    return this.storage.setItem(ONBOARDED_KEY, "1");
  }
}
