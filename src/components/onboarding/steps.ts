import { Award, Briefcase, Code, FileText, Target, User, type LucideIcon } from "lucide-react";

export interface OnboardingStep {
  slug: string;
  label: string;
  icon: LucideIcon;
  strength: number;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { slug: "basic", label: "Basic Info", icon: User, strength: 15 },
  { slug: "preferences", label: "Preferences", icon: Target, strength: 32 },
  { slug: "experience", label: "Experience", icon: Briefcase, strength: 48 },
  { slug: "skills", label: "Skills", icon: Code, strength: 64 },
  { slug: "resume", label: "Resume", icon: FileText, strength: 82 },
  { slug: "additional", label: "Additional", icon: Award, strength: 92 },
];

export function stepHref(index: number): string {
  const step = ONBOARDING_STEPS[index];
  return step ? `/onboarding/${step.slug}` : "/onboarding/complete";
}

export function strengthLabel(p: number): string {
  if (p < 30) return "Getting started";
  if (p < 80) return "Looking good";
  if (p < 100) return "Almost there";
  return "Complete";
}
