"use client";

import { Briefcase, Calendar, DollarSign, GraduationCap, Search, Sparkles, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { SelectField, TextField } from "@/components/forms/field";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { OptionCard, OptionPill, TagInput } from "../controls";
import { OnboardingFooter, OnboardingShell } from "../onboarding-shell";
import { stepHref } from "../steps";

const STATUSES = [
  { title: "Student", caption: "Currently studying", icon: GraduationCap },
  { title: "Fresher", caption: "0–1 years", icon: Sparkles },
  { title: "Employed", caption: "Open to better roles", icon: Briefcase },
  { title: "Actively looking", caption: "Available now", icon: Search },
] as const;
const WORK_TYPES = ["Remote", "Hybrid", "On-site"] as const;
const NOTICE = ["Immediately", "15 days", "30 days", "60 days", "90 days"] as const;

export function PreferencesStep() {
  const router = useRouter();
  const { draft, update } = useOnboardingStore();
  const toggleWorkType = (t: string) =>
    update({ workTypes: draft.workTypes.includes(t) ? draft.workTypes.filter((x) => x !== t) : [...draft.workTypes, t] });

  return (
    <OnboardingShell
      stepIndex={1}
      title={
        <>
          Your career <span className="hl">preferences</span>
        </>
      }
      description="Tell us what you're looking for. We'll only match you with roles that fit."
      footer={<OnboardingFooter stepIndex={1} onContinue={() => router.push(stepHref(2))} />}
    >
      <div className="ob-label" id="status-label">
        Current employment status
      </div>
      <div className="opt-cards" role="radiogroup" aria-labelledby="status-label">
        {STATUSES.map((s) => (
          <OptionCard
            key={s.title}
            icon={s.icon}
            title={s.title}
            caption={s.caption}
            selected={draft.employmentStatus === s.title}
            onSelect={() => update({ employmentStatus: s.title })}
          />
        ))}
      </div>
      <div className="field">
        <label>Preferred job roles</label>
        <TagInput ariaLabel="Preferred job roles" values={draft.roles} onChange={(roles) => update({ roles })} addLabel="Add role" />
      </div>
      <div className="grid-2">
        <div className="field">
          <label>Preferred locations</label>
          <TagInput ariaLabel="Preferred locations" values={draft.locations} onChange={(locations) => update({ locations })} />
        </div>
        <div className="field">
          <label>Work type</label>
          <div className="opt-row" role="group" aria-label="Work type">
            {WORK_TYPES.map((t) => (
              <OptionPill key={t} label={t} square selected={draft.workTypes.includes(t)} onSelect={() => toggleWorkType(t)} />
            ))}
          </div>
        </div>
        <TextField
          id="pref-salary"
          label="Expected salary (USD / year)"
          icon={DollarSign}
          placeholder="140,000 – 170,000"
          value={draft.salary}
          onChange={(e) => update({ salary: e.target.value })}
        />
        <SelectField
          id="pref-notice"
          label="Notice period"
          icon={Calendar}
          options={NOTICE}
          placeholder="Select"
          value={draft.noticePeriod}
          onChange={(e) => update({ noticePeriod: e.target.value })}
        />
      </div>
      <div className="ai-tip">
        <span className="tip-ic">
          <TrendingUp className="ic ic-sm" />
        </span>
        <span>
          Adding a salary range and preferred roles helps JobAI rank the <b>most relevant</b> matches first.
        </span>
      </div>
    </OnboardingShell>
  );
}
