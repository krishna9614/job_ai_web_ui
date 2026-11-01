import type { Metadata } from "next";
import { ResumeStep } from "@/components/onboarding/steps/resume-step";

export const metadata: Metadata = { title: "Resume & portfolio" };

export default function Page() {
  return <ResumeStep />;
}
