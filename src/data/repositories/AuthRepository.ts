import type { Client, Role } from "@/types/domain";

export type RegistrationInput = { name: string; email: string; phone: string; password: string };
export type VerificationPurpose = "register" | "recover";

/** Utilizador autenticado e, no perfil prestador, o id do prestador associado. */
export type Session = { user: Client; providerId?: string };

/** Sessão e conta do utilizador. */
export interface AuthRepository {
  login(email: string, password: string, role: Role): Promise<Session>;
  /** Cria a conta por confirmar e envia o código por email. */
  register(input: RegistrationInput): Promise<void>;
  requestRecovery(email: string): Promise<void>;
  /** Confirma o código de 6 dígitos e devolve o utilizador autenticado. */
  verifyCode(email: string, code: string, purpose: VerificationPurpose): Promise<Session>;
  resendCode(email: string): Promise<void>;
  updateProfile(clientId: string, data: Partial<Pick<Client, "name" | "email" | "phone">>): Promise<Client>;
  changePassword(current: string, next: string): Promise<void>;
  logout(): Promise<void>;
}
