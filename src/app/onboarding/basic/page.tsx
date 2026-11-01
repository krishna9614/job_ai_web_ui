import type { Metadata } from "next";
import { BasicStep } from "@/components/onboarding/steps/basic-step";

export const metadata: Metadata = { title: "Basic information" };

export default function Page() {
  return <BasicStep />;
}
