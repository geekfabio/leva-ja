import { create } from "zustand";
import type { Client, Role } from "@/types/domain";
import { demoIdentity, isRepositoryError, repositories, sessionVault, type Session } from "@/data";

type PendingRegistration = { name: string; email: string; phone: string };

/** Utilizador sem sessão (modo API antes do login). */
const GUEST: Client = { id: "guest", name: "Convidado", email: "", phone: "", initials: "AL", rating: 0 };

type SessionState = {
  /** `true` depois de ler a sessão guardada no arranque (o splash espera por isto). */
  restored: boolean;
  hasOnboarded: boolean;
  role: Role | null;
  authenticated: boolean;
  /** Token de acesso; também fica no armazenamento seguro. */
  token: string | null;
  user: Client;
  /** Prestador associado à conta, quando o perfil é prestador. */
  providerId: string | null;
  pendingRegistration: PendingRegistration | null;
  /** Email à espera de confirmação (registo ou recuperação). */
  verificationEmail: string | null;
  verificationPurpose: "register" | "recover" | null;
  locationGranted: boolean | null;
  /** Retoma a sessão guardada no armazenamento seguro, se ainda for válida. */
  restore: () => Promise<void>;
  completeOnboarding: () => void;
  setRole: (role: Role) => void;
  login: (email: string, password: string) => Promise<void>;
  /** Passo 1 do registo: guarda os dados localmente até à palavra-passe. */
  startRegistration: (data: PendingRegistration) => void;
  /** Passo 2: cria a conta e envia o código. */
  register: (password: string) => Promise<void>;
  startRecovery: (email: string) => Promise<void>;
  verify: (code: string) => Promise<void>;
  resendCode: () => Promise<void>;
  setLocationGranted: (granted: boolean) => void;
  updateProfile: (data: Partial<Pick<Client, "name" | "email" | "phone">>) => Promise<void>;
  changePassword: (current: string, next: string) => Promise<void>;
  logout: () => Promise<void>;
  /** A API recusou o token: termina a sessão local, mantém o perfil para o novo login. */
  expire: () => Promise<void>;
};

/** Falhar a escrita no armazenamento seguro não impede a sessão em curso. */
const persist = (write: Promise<void>) => write.catch((error) => console.warn("Armazenamento seguro:", error));

/**
 * Sessão do utilizador. A autenticação passa pelo AuthRepository; o token e o
 * perfil ficam no armazenamento seguro (SessionVault) para retomar a sessão.
 */
export const useSessionStore = create<SessionState>((set, get) => {
  /** Aplica uma sessão nova e guarda-a no dispositivo. */
  const start = (session: Session, extra: Partial<SessionState> = {}) => {
    const role = get().role ?? "client";
    set((s) => ({ ...extra, authenticated: true, role, token: session.token, user: session.user, providerId: session.providerId ?? s.providerId }));
    return persist(sessionVault().save({ token: session.token, role }));
  };

  return {
    restored: false,
    hasOnboarded: false,
    role: null,
    authenticated: false,
    token: null,
    user: demoIdentity?.user ?? GUEST,
    providerId: demoIdentity?.providerId ?? null,
    pendingRegistration: null,
    verificationEmail: null,
    verificationPurpose: null,
    locationGranted: null,
    restore: async () => {
      const vault = sessionVault();
      try {
        const [hasOnboarded, stored] = await Promise.all([vault.hasOnboarded(), vault.load()]);
        if (hasOnboarded) set({ hasOnboarded });
        if (!stored) return;
        try {
          const session = await repositories().auth.restore(stored.token);
          set((s) => ({ authenticated: true, role: stored.role, token: session.token, user: session.user, providerId: session.providerId ?? s.providerId }));
        } catch (error) {
          // Token inválido: apaga-o. Sem rede: mantém-no para a próxima abertura.
          if (isRepositoryError(error) && error.code === "unauthorized") await vault.clear();
        }
      } catch (error) {
        console.warn("Armazenamento seguro:", error);
      } finally {
        set({ restored: true });
      }
    },
    completeOnboarding: () => {
      set({ hasOnboarded: true });
      persist(sessionVault().markOnboarded());
    },
    setRole: (role) => set({ role }),
    login: async (email, password) => {
      await start(await repositories().auth.login(email, password, get().role ?? "client"));
    },
    startRegistration: (data) => set({ pendingRegistration: data }),
    register: async (password) => {
      const pending = get().pendingRegistration;
      if (!pending) throw new Error("Registo sem dados.");
      await repositories().auth.register({ ...pending, password });
      set({ verificationEmail: pending.email, verificationPurpose: "register" });
    },
    startRecovery: async (email) => {
      await repositories().auth.requestRecovery(email);
      set({ verificationEmail: email, verificationPurpose: "recover" });
    },
    verify: async (code) => {
      const { verificationEmail, verificationPurpose } = get();
      const session = await repositories().auth.verifyCode(verificationEmail ?? "", code, verificationPurpose ?? "register");
      await start(session, { pendingRegistration: null, verificationPurpose: null });
    },
    resendCode: () => repositories().auth.resendCode(get().verificationEmail ?? ""),
    setLocationGranted: (locationGranted) => set({ locationGranted }),
    updateProfile: async (data) => {
      const user = await repositories().auth.updateProfile(get().user.id, data);
      set({ user });
    },
    changePassword: (current, next) => repositories().auth.changePassword(current, next),
    logout: async () => {
      const { token } = get();
      // A sessão local termina sempre, mesmo que o servidor não responda.
      set({ authenticated: false, role: null, token: null });
      await persist(sessionVault().clear());
      if (token) await repositories().auth.logout(token).catch(() => undefined);
    },
    expire: async () => {
      set({ authenticated: false, token: null });
      await persist(sessionVault().clear());
    },
  };
});
