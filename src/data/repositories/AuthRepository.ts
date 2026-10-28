import type { Client, Role } from "@/types/domain";

export type RegistrationInput = { name: string; email: string; phone: string; password: string };
export type VerificationPurpose = "register" | "recover";

/**
 * Utilizador autenticado e, no perfil prestador, o id do prestador associado.
 * `token` é o token de acesso (curto); `refreshToken` serve para obter um novo
 * sem pedir a palavra-passe. Ambos ficam no armazenamento seguro.
 */
export type Session = { token: string; refreshToken?: string; user: Client; providerId?: string };

/** Sessão e conta do utilizador. */
export interface AuthRepository {
  login(email: string, password: string, role: Role): Promise<Session>;
  /** Cria a conta por confirmar e envia o código por email. */
  register(input: RegistrationInput): Promise<void>;
  requestRecovery(email: string): Promise<void>;
  /** Confirma o código de 6 dígitos e devolve o utilizador autenticado. */
  verifyCode(email: string, code: string, purpose: VerificationPurpose): Promise<Session>;
  resendCode(email: string): Promise<void>;
  /** Retoma uma sessão guardada. Falha com `unauthorized` se o token já não for válido. */
  restore(token: string): Promise<Session>;
  /** Troca o refresh token por uma sessão nova (o refresh token antigo deixa de valer). */
  refresh(refreshToken: string): Promise<Session>;
  updateProfile(clientId: string, data: Partial<Pick<Client, "name" | "email" | "phone">>): Promise<Client>;
  changePassword(current: string, next: string): Promise<void>;
  /** Invalida o token no servidor. */
  logout(token: string): Promise<void>;
}
