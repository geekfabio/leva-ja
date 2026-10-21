import { create } from "zustand";
import type { Client, Role } from "@/types/domain";
import { currentClient } from "@/mocks/people";
import { initialsOf } from "@/utils/format";

type PendingRegistration = { name: string; email: string; phone: string };

type SessionState = {
  hasOnboarded: boolean;
  role: Role | null;
  authenticated: boolean;
  user: Client;
  pendingRegistration: PendingRegistration | null;
  /** Email à espera de confirmação (registo ou recuperação). */
  verificationEmail: string | null;
  verificationPurpose: "register" | "recover" | null;
  locationGranted: boolean | null;
  completeOnboarding: () => void;
  setRole: (role: Role) => void;
  login: (email: string) => void;
  startRegistration: (data: PendingRegistration) => void;
  startRecovery: (email: string) => void;
  confirmEmail: () => void;
  setLocationGranted: (granted: boolean) => void;
  updateProfile: (data: Partial<Pick<Client, "name" | "email" | "phone">>) => void;
  logout: () => void;
};

/**
 * Sessão simulada. Não há autenticação real: qualquer email válido entra e o
 * código de verificação é sempre 123456. Mantida em memória (reinicia com a app).
 */
export const useSessionStore = create<SessionState>((set) => ({
  hasOnboarded: false,
  role: null,
  authenticated: false,
  user: currentClient,
  pendingRegistration: null,
  verificationEmail: null,
  verificationPurpose: null,
  locationGranted: null,
  completeOnboarding: () => set({ hasOnboarded: true }),
  setRole: (role) => set({ role }),
  login: (email) =>
    set((s) => ({
      authenticated: true,
      user: email.toLowerCase() === currentClient.email ? currentClient : { ...s.user, email: email.toLowerCase() },
    })),
  startRegistration: (data) => set({ pendingRegistration: data, verificationEmail: data.email, verificationPurpose: "register" }),
  startRecovery: (email) => set({ verificationEmail: email, verificationPurpose: "recover" }),
  confirmEmail: () =>
    set((s) => {
      const reg = s.pendingRegistration;
      return {
        authenticated: true,
        verificationPurpose: null,
        pendingRegistration: null,
        user: reg
          ? { ...s.user, id: "cli-new", name: reg.name, email: reg.email, phone: `+244 ${reg.phone.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3")}`, initials: initialsOf(reg.name), rating: 5 }
          : s.user,
      };
    }),
  setLocationGranted: (locationGranted) => set({ locationGranted }),
  updateProfile: (data) => set((s) => ({ user: { ...s.user, ...data, initials: initialsOf(data.name ?? s.user.name) } })),
  logout: () => set({ authenticated: false, role: null }),
}));
