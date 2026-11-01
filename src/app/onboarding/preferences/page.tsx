import type { Metadata } from "next";
import { PreferencesStep } from "@/components/onboarding/steps/preferences-step";

export const metadata: Metadata = { title: "Career preferences" };

export default function Page() {
  return <PreferencesStep />;
}
