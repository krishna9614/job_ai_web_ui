import { create } from "zustand";

/**
 * Client-only onboarding state. Every step's answers are loaded from and saved to the API; this
 * only keeps what has no backend yet: the name typed at sign-up (pre-fills Basic Info before the
 * profile exists) and the picked resume file (file storage isn't connected).
 */
export interface OnboardingDraft {
  fullNameHint: string;
  resumeFile: { name: string; size: number } | null;
}

const initialDraft: OnboardingDraft = { fullNameHint: "", resumeFile: null };

interface OnboardingState {
  draft: OnboardingDraft;
  update: (patch: Partial<OnboardingDraft>) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()((set) => ({
  draft: initialDraft,
  update: (patch) => set((state) => ({ draft: { ...state.draft, ...patch } })),
  reset: () => set({ draft: initialDraft }),
}));
