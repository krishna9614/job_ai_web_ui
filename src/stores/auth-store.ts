import { create } from "zustand";
import type { User } from "@/types/api";

export type AuthStatus = "unknown" | "authenticated" | "unauthenticated";

interface AuthState {
  user: User | null;
  status: AuthStatus;
  /** Email awaiting confirmation after signup (shown on the verify screen). */
  pendingVerificationEmail: string | null;
  /** Set when the backend rejected the session, so the login screen can explain why. */
  sessionExpired: boolean;
  setUser: (user: User) => void;
  setPendingVerificationEmail: (email: string | null) => void;
  markSessionExpired: () => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  status: "unknown",
  pendingVerificationEmail: null,
  sessionExpired: false,
  setUser: (user) => set({ user, status: "authenticated", sessionExpired: false }),
  setPendingVerificationEmail: (pendingVerificationEmail) => set({ pendingVerificationEmail }),
  markSessionExpired: () => set({ user: null, status: "unauthenticated", sessionExpired: true }),
  reset: () => set({ user: null, status: "unauthenticated", sessionExpired: false }),
}));
