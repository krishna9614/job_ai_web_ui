"use client";

import { Code, Plus, Sparkles, Users, Wrench } from "lucide-react";
import { useState } from "react";
import { Notice } from "@/components/ui/notice";
import { useReplaceSkills, useSkills } from "@/hooks/use-profile-setup";
import { ApiError } from "@/lib/api/errors";
import type { Skill, SkillCategory } from "@/types/api";
import { TagInput } from "../controls";
import { OnboardingFooter, OnboardingShell } from "../onboarding-shell";
import { useStepNav } from "../use-step-nav";

const MAX_TECH = 20;
const SUGGESTED = ["Accessibility (WCAG)", "Usability Testing", "A/B Testing", "Journey Mapping", "Design Tokens"];

interface SkillsForm {
  technicalSkills: string[];
  softSkills: string[];
  tools: string[];
}

function toForm(skills: Skill[] | undefined): SkillsForm {
  const of = (c: SkillCategory) => (skills ?? []).filter((s) => (s.category ?? "technical") === c).map((s) => s.name);
  return { technicalSkills: of("technical"), softSkills: of("soft"), tools: of("tool") };
}

/** Step 4 — saved to skills (shared catalogue) + user_skills, with the category on each skill. */
export function SkillsStep() {
  const nav = useStepNav(3);
  const saved = useSkills();
  const replace = useReplaceSkills();
  const [edited, setEdited] = useState<SkillsForm | null>(null);
  const draft = edited ?? toForm(saved.data);
  const update = (patch: Partial<SkillsForm>) => setEdited({ ...draft, ...patch });
  const suggestions = SUGGESTED.filter((s) => !draft.technicalSkills.includes(s));

  const persist = async (): Promise<boolean> => {
    if (!edited) return true;
    try {
      await replace.mutateAsync([
        ...draft.technicalSkills.map((name) => ({ name, category: "technical" as const })),
        ...draft.softSkills.map((name) => ({ name, category: "soft" as const })),
        ...draft.tools.map((name) => ({ name, category: "tool" as const })),
      ]);
      setEdited(null);
      return true;
    } catch {
      return false;
    }
  };

  const apiError = (replace.error ?? saved.error) instanceof ApiError ? ((replace.error ?? saved.error) as ApiError) : null;

  return (
    <OnboardingShell
      stepIndex={3}
      title={
        <>
          Skills &amp; <span className="hl">expertise</span>
        </>
      }
      description="Add your skills to improve match accuracy. Press Enter to add each one."
      onSaveExit={() => void nav.exit(persist)}
      onLeave={(href) => void nav.go(persist, href)}
      loading={saved.isPending}
      footer={
        <OnboardingFooter
          stepIndex={3}
          onBack={() => void nav.back(persist)}
          skip
          onSkip={nav.skip}
          onContinue={() => void nav.next(persist)}
          loading={nav.busy || saved.isPending}
        />
      }
    >
      {apiError ? <Notice tone="err">{apiError.message}</Notice> : null}
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
        <TagInput ariaLabel="Soft skills" values={draft.softSkills} onChange={(softSkills) => update({ softSkills })} max={30} />
      </div>
      <div className="field">
        <label>
          <span className="lbl-ic">
            <Wrench className="ic ic-xs" />
            Tools &amp; technologies
          </span>
        </label>
        <TagInput ariaLabel="Tools and technologies" values={draft.tools} onChange={(tools) => update({ tools })} addLabel="Add tool" max={30} />
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
