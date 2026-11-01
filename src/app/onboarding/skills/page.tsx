import type { Metadata } from "next";
import { SkillsStep } from "@/components/onboarding/steps/skills-step";

export const metadata: Metadata = { title: "Skills & expertise" };

export default function Page() {
  return <SkillsStep />;
}
