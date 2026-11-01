import type { Metadata } from "next";
import { ExperienceStep } from "@/components/onboarding/steps/experience-step";

export const metadata: Metadata = { title: "Work experience" };

export default function Page() {
  return <ExperienceStep />;
}
