import { create } from "zustand";

/**
 * Client-only answers for the onboarding steps that have no backend contract yet
 * (preferences, experience, skills, resume file, additional info). Kept in memory so values
 * survive moving between steps; nothing here is sent to the API.
 */
export interface Experience {
  id: string;
  company: string;
  title: string;
  employmentType: string;
  start: string;
  end: string;
  location: string;
  responsibilities: string;
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  years: string;
}

export interface OnboardingDraft {
  fullNameHint: string;
  totalExperience: string;
  employmentStatus: string;
  roles: string[];
  locations: string[];
  workTypes: string[];
  salary: string;
  noticePeriod: string;
  experienceLevel: "fresher" | "experienced";
  experiences: Experience[];
  technicalSkills: string[];
  softSkills: string[];
  tools: string[];
  resumeFile: { name: string; size: number } | null;
  portfolioUrl: string;
  languages: string[];
  certifications: string[];
  education: Education[];
  careerGaps: string;
  workAuthorization: string;
  relocate: string;
  discoverable: boolean;
  dailyDigest: boolean;
}

const initialDraft: OnboardingDraft = {
  fullNameHint: "",
  totalExperience: "",
  employmentStatus: "",
  roles: [],
  locations: [],
  workTypes: [],
  salary: "",
  noticePeriod: "",
  experienceLevel: "experienced",
  experiences: [],
  technicalSkills: [],
  softSkills: [],
  tools: [],
  resumeFile: null,
  portfolioUrl: "",
  languages: [],
  certifications: [],
  education: [],
  careerGaps: "None",
  workAuthorization: "",
  relocate: "",
  discoverable: true,
  dailyDigest: true,
};

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
