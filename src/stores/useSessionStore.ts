import { create } from "zustand";
import type { Client, Role } from "@/types/domain";
import { demoIdentity, repositories } from "@/data";

type PendingRegistration = { name: string; email: string; phone: string };

/** Utilizador sem sessão (modo API antes do login). */
const GUEST: Client = { id: "guest", name: "Convidado", email: "", phone: "", initials: "LJ", rating: 0 };

type SessionState = {
  hasOnboarded: boolean;
  role: Role | null;
  authenticated: boolean;
  user: Client;
  /** Prestador associado à conta, quando o perfil é prestador. */
  providerId: string | null;
  pendingRegistration: PendingRegistration | null;
  /** Email à espera de confirmação (registo ou recuperação). */
  verificationEmail: string | null;
  verificationPurpose: "register" | "recover" | null;
  locationGranted: boolean | null;
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
};

/**
 * Sessão do utilizador. A autenticação passa pelo AuthRepository; esta store só
 * guarda o resultado e o estado do fluxo de entrada (em memória).
 */
export const useSessionStore = create<SessionState>((set, get) => ({
  hasOnboarded: false,
  role: null,
  authenticated: false,
  user: demoIdentity?.user ?? GUEST,
  providerId: demoIdentity?.providerId ?? null,
  pendingRegistration: null,
  verificationEmail: null,
  verificationPurpose: null,
  locationGranted: null,
  completeOnboarding: () => set({ hasOnboarded: true }),
  setRole: (role) => set({ role }),
  login: async (email, password) => {
    const session = await repositories().auth.login(email, password, get().role ?? "client");
    set((s) => ({ authenticated: true, user: session.user, providerId: session.providerId ?? s.providerId }));
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
    set((s) => ({ authenticated: true, user: session.user, providerId: session.providerId ?? s.providerId, pendingRegistration: null, verificationPurpose: null }));
  },
  resendCode: () => repositories().auth.resendCode(get().verificationEmail ?? ""),
  setLocationGranted: (locationGranted) => set({ locationGranted }),
  updateProfile: async (data) => {
    const user = await repositories().auth.updateProfile(get().user.id, data);
    set({ user });
  },
  changePassword: (current, next) => repositories().auth.changePassword(current, next),
  logout: async () => {
    await repositories().auth.logout();
    set({ authenticated: false, role: null });
  },
}));
