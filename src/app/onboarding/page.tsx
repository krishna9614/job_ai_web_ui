"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ONBOARDING_STEPS, stepHref } from "@/components/onboarding/steps";
import { useCurrentUser } from "@/hooks/use-auth";

/** Resumes setup at the step saved by "Save & exit"; a finished setup reopens at Basic Info for editing. */
export default function OnboardingIndex() {
  const router = useRouter();
  const user = useCurrentUser();

  useEffect(() => {
    if (user.isPending) return;
    const u = user.data;
    const step = u && u.onboarding_status !== "completed" ? Math.min(u.onboarding_step, ONBOARDING_STEPS.length - 1) : 0;
    router.replace(stepHref(Math.max(step, 0)));
  }, [user.isPending, user.data, router]);

  return <main className="auth ob" aria-busy="true" />;
}
