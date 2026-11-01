"use client";

import { Code, Plus, Sparkles, Users, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { TagInput } from "../controls";
import { OnboardingFooter, OnboardingShell } from "../onboarding-shell";
import { stepHref } from "../steps";

const MAX_TECH = 20;
const SUGGESTED = ["Accessibility (WCAG)", "Usability Testing", "A/B Testing", "Journey Mapping", "Design Tokens"];

export function SkillsStep() {
  const router = useRouter();
  const { draft, update } = useOnboardingStore();
  const suggestions = SUGGESTED.filter((s) => !draft.technicalSkills.includes(s));

  return (
    <OnboardingShell
      stepIndex={3}
      title={
        <>
          Skills &amp; <span className="hl">expertise</span>
        </>
      }
      description="Add your skills to improve match accuracy. Press Enter to add each one."
      footer={<OnboardingFooter stepIndex={3} skip onContinue={() => router.push(stepHref(4))} />}
    >
      <div className="field">
        <label>
          <span className="lbl-ic">
            <Code className="ic ic-xs" />
            Technical skills
          </span>
          <small className="count">
            {draft.technicalSkills.length} / {MAX_TECH}
          </small>
        </label>
        <TagInput
          ariaLabel="Technical skills"
          values={draft.technicalSkills}
          onChange={(technicalSkills) => update({ technicalSkills })}
          addLabel="Add skill"
          max={MAX_TECH}
        />
      </div>
      <div className="field">
        <label>
          <span className="lbl-ic">
            <Users className="ic ic-xs" />
            Soft skills
          </span>
        </label>
        <TagInput ariaLabel="Soft skills" values={draft.softSkills} onChange={(softSkills) => update({ softSkills })} />
      </div>
      <div className="field">
        <label>
          <span className="lbl-ic">
            <Wrench className="ic ic-xs" />
            Tools &amp; technologies
          </span>
        </label>
        <TagInput ariaLabel="Tools and technologies" values={draft.tools} onChange={(tools) => update({ tools })} addLabel="Add tool" />
      </div>
      {suggestions.length ? (
        <div className="suggest">
          <div className="suggest-head">
            <span className="tip-ic">
              <Sparkles className="ic ic-sm" />
            </span>
            <div>
              <b>Suggested by JobAI</b>
              <small>Popular skills in the roles you&apos;re targeting</small>
            </div>
          </div>
          <div className="suggest-tags">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                className="tag-add"
                disabled={draft.technicalSkills.length >= MAX_TECH}
                onClick={() => update({ technicalSkills: [...draft.technicalSkills, s] })}
              >
                <Plus className="ic" />
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </OnboardingShell>
  );
}
