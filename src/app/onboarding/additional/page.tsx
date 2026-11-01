import type { Metadata } from "next";
import { AdditionalStep } from "@/components/onboarding/steps/additional-step";

export const metadata: Metadata = { title: "Additional information" };

export default function Page() {
  return <AdditionalStep />;
}
