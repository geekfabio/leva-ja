import type { Client, Role } from "@/types/domain";
import { DEMO_OTP } from "@/features/auth/schemas";
import { currentClient } from "@/mocks/people";
import { initialsOf } from "@/utils/format";
import type { AuthRepository, RegistrationInput, Session, VerificationPurpose } from "../repositories/AuthRepository";
import { DEMO_PROVIDER_ID } from "./demo";
import { RepositoryError } from "../repositories/types";
import { db, type MockDatabase } from "./database";
import { clone, simulate } from "./runtime";

const formatPhone = (digits: string) => `+244 ${digits.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3")}`;

/** Autenticação simulada: qualquer email válido entra; o código é sempre 123456. */
export class MockAuthRepository implements AuthRepository {
  constructor(private readonly database: MockDatabase = db) {}

  /** Emite um token e regista a sessão, como faria o servidor. */
  private open(session: Omit<Session, "token">): Session {
    const token = `mock.${session.user.id}.${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
    this.database.sessions.set(token, clone(session));
    return { token, ...session };
  }

  private byEmail(email: string) {
    return [...this.database.clients.values()].find((c) => c.email.toLowerCase() === email.toLowerCase());
  }

  login(email: string, password: string, role: Role) {
    return simulate<Session>(() => {
      if (password.length < 6) throw new RepositoryError("unauthorized", "Email ou palavra-passe incorrectos.");
      // Demonstração: um email desconhecido entra com os dados do cliente de exemplo.
      const user = clone(this.byEmail(email) ?? { ...currentClient, email: email.toLowerCase() });
      return this.open({ user, providerId: role === "provider" ? DEMO_PROVIDER_ID : undefined });
    }, 700);
  }

  register(input: RegistrationInput) {
    return simulate(() => {
      if (this.byEmail(input.email)) throw new RepositoryError("validation", "Já existe uma conta com este email.");
      const client: Client = { id: `cli-${Date.now()}`, name: input.name, email: input.email.toLowerCase(), phone: formatPhone(input.phone), initials: initialsOf(input.name), rating: 5 };
      this.database.pending.set(client.email, { purpose: "register", client });
    }, 600);
  }

  requestRecovery(email: string) {
    return simulate(() => {
      this.database.pending.set(email.toLowerCase(), { purpose: "recover" });
    }, 700);
  }

  verifyCode(email: string, code: string, purpose: VerificationPurpose) {
    return simulate<Session>(() => {
      if (code !== DEMO_OTP) throw new RepositoryError("validation", "Código incorrecto. Na demonstração usa 123456.");
      const pending = this.database.pending.get(email.toLowerCase());
      this.database.pending.delete(email.toLowerCase());
      if (purpose === "register" && pending?.client) {
        this.database.clients.set(pending.client.id, pending.client);
        this.database.addresses.set(pending.client.id, []);
        return this.open({ user: clone(pending.client) });
      }
      return this.open({ user: clone(this.byEmail(email) ?? { ...currentClient, email: email.toLowerCase() }) });
    }, 600);
  }

  resendCode() {
    return simulate(() => undefined, 300);
  }

  restore(token: string) {
    return simulate<Session>(() => {
      const session = this.database.sessions.get(token);
      if (!session) throw new RepositoryError("unauthorized", "A sessão expirou. Entra de novo.");
      // Dados actuais do utilizador (o perfil pode ter mudado desde o login).
      const user = this.database.clients.get(session.user.id) ?? session.user;
      return { token, user: clone(user), providerId: session.providerId };
    }, 300);
  }

  updateProfile(clientId: string, data: Partial<Pick<Client, "name" | "email" | "phone">>) {
    return simulate(() => {
      const client = this.database.clients.get(clientId) ?? { ...currentClient, id: clientId };
      const updated = { ...client, ...data, initials: initialsOf(data.name ?? client.name) };
      this.database.clients.set(clientId, updated);
      return clone(updated);
    }, 600);
  }

  changePassword(current: string, next: string) {
    return simulate(() => {
      if (current === next) throw new RepositoryError("validation", "Escolhe uma palavra-passe diferente da actual.");
    }, 700);
  }

  logout(token: string) {
    return simulate(() => {
      this.database.sessions.delete(token);
    }, 0);
  }
}
