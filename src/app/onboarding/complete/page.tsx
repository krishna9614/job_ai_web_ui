import type { Metadata } from "next";
import { CompleteStep } from "@/components/onboarding/steps/complete-step";

export const metadata: Metadata = { title: "Profile complete" };

export default function Page() {
  return <CompleteStep />;
}
