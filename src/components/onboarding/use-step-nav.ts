"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUpdateOnboarding } from "@/hooks/use-profile-setup";
import { ONBOARDING_STEPS, stepHref } from "./steps";

/** Persists the current step, records progress (so "Save & exit" resumes there), then navigates. */
export function useStepNav(stepIndex: number) {
  const router = useRouter();
  const onboarding = useUpdateOnboarding();
  const [busy, setBusy] = useState(false);
  const last = stepIndex === ONBOARDING_STEPS.length - 1;

  const run = async (persist: (() => Promise<boolean>) | null, target: "next" | "exit") => {
    setBusy(true);
    try {
      if (persist && !(await persist())) return;
      const step = target === "exit" ? stepIndex : stepIndex + 1;
      // Progress tracking is best-effort: a failure here must not trap the user on the step.
      await onboarding
        .mutateAsync(
          target === "next" && last
            ? { onboarding_step: ONBOARDING_STEPS.length, onboarding_status: "completed" }
            : { onboarding_step: step },
        )
        .catch(() => undefined);
      router.push(target === "exit" ? "/dashboard" : stepHref(step));
    } finally {
      setBusy(false);
    }
  };

  return {
    busy,
    next: (persist: () => Promise<boolean>) => run(persist, "next"),
    skip: () => run(null, "next"),
    exit: (persist: () => Promise<boolean>) => run(persist, "exit"),
  };
}
