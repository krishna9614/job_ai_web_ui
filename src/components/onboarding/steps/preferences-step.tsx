"use client";

import { Briefcase, Calendar, GraduationCap, Search, Sparkles, TrendingUp } from "lucide-react";
import { useState } from "react";
import { FieldShell, InputBox, SelectField } from "@/components/forms/field";
import { Notice } from "@/components/ui/notice";
import { usePreferences, useUpdatePreferences } from "@/hooks/use-profile-setup";
import { ApiError } from "@/lib/api/errors";
import {
  CURRENCIES,
  NOTICE_PERIODS,
  WORK_TYPE_LABELS,
  formatSalary,
  parseSalaryRange,
} from "@/lib/profile/setup-options";
import type { EmploymentStatus, Preferences, WorkType } from "@/types/api";
import { OptionCard, OptionPill, TagInput } from "../controls";
import { OnboardingFooter, OnboardingShell } from "../onboarding-shell";
import { useStepNav } from "../use-step-nav";

const STATUSES = [
  { code: "student", title: "Student", caption: "Currently studying", icon: GraduationCap },
  { code: "fresher", title: "Fresher", caption: "0–1 years", icon: Sparkles },
  { code: "employed", title: "Employed", caption: "Open to better roles", icon: Briefcase },
  { code: "actively_looking", title: "Actively looking", caption: "Available now", icon: Search },
] as const satisfies readonly { code: EmploymentStatus; title: string; caption: string; icon: unknown }[];
const WORK_TYPES = Object.keys(WORK_TYPE_LABELS) as WorkType[];
const NOTICE = NOTICE_PERIODS.map((n) => n.label);

interface PreferencesForm {
  employmentStatus: EmploymentStatus | null;
  roles: string[];
  locations: string[];
  workTypes: WorkType[];
  salary: string;
  currency: string;
  notice: string;
}

function toForm(p: Preferences | undefined): PreferencesForm {
  const currency = p?.salary_currency ?? "INR";
  const salary = [p?.minimum_salary, p?.maximum_salary]
    .filter((n): n is number => n !== null && n !== undefined)
    .map((n) => formatSalary(n, currency))
    .join(" – ");
  return {
    employmentStatus: p?.employment_status ?? null,
    roles: p?.preferred_job_titles ?? [],
    locations: p?.preferred_locations ?? [],
    workTypes: p?.preferred_work_types ?? [],
    salary,
    currency,
    notice: NOTICE_PERIODS.find((n) => n.days === p?.notice_period_days)?.label ?? "",
  };
}

/** Step 2 — saved to job_preferences; the employment status also drives the Experience step's Skip. */
export function PreferencesStep() {
  const nav = useStepNav(1);
  const prefs = usePreferences();
  const save = useUpdatePreferences();
  const [edited, setEdited] = useState<PreferencesForm | null>(null);
  const [salaryError, setSalaryError] = useState<string | null>(null);
  const form = edited ?? toForm(prefs.data);
  const update = (patch: Partial<PreferencesForm>) => setEdited({ ...form, ...patch });
  const toggleWorkType = (t: WorkType) =>
    update({ workTypes: form.workTypes.includes(t) ? form.workTypes.filter((x) => x !== t) : [...form.workTypes, t] });

  const persist = async (): Promise<boolean> => {
    if (!edited) return true;
    const salary = parseSalaryRange(form.salary);
    if (!salary) {
      setSalaryError("Enter an amount or a range, e.g. 12,00,000 – 18,00,000");
      return false;
    }
    if (salary.min !== null && salary.max !== null && salary.min > salary.max) {
      setSalaryError("The first amount must not be more than the second");
      return false;
    }
    setSalaryError(null);
    const hasSalary = salary.min !== null;
    try {
      await save.mutateAsync({
        employment_status: form.employmentStatus,
        preferred_job_titles: form.roles,
        preferred_locations: form.locations,
        preferred_work_types: form.workTypes,
        minimum_salary: salary.min,
        maximum_salary: salary.max,
        salary_currency: hasSalary ? form.currency : null,
        salary_period: hasSalary ? "yearly" : null,
        notice_period_days: NOTICE_PERIODS.find((n) => n.label === form.notice)?.days ?? null,
      });
      setEdited(null);
      return true;
    } catch {
      return false;
    }
  };

  const apiError = (save.error ?? prefs.error) instanceof ApiError ? ((save.error ?? prefs.error) as ApiError) : null;

  return (
    <OnboardingShell
      stepIndex={1}
      title={
        <>
          Your career <span className="hl">preferences</span>
        </>
      }
      description="Tell us what you're looking for. We'll only match you with roles that fit."
      onSaveExit={() => void nav.exit(persist)}
      onLeave={(href) => void nav.go(persist, href)}
      loading={prefs.isPending}
      footer={<OnboardingFooter stepIndex={1} onBack={() => void nav.back(persist)} onContinue={() => void nav.next(persist)} loading={nav.busy || prefs.isPending} />}
    >
      {apiError ? <Notice tone="err">{apiError.message}</Notice> : null}
      <div className="ob-label" id="status-label">
        Current employment status
      </div>
      <div className="opt-cards" role="radiogroup" aria-labelledby="status-label">
        {STATUSES.map((s) => (
          <OptionCard
            key={s.code}
            icon={s.icon}
            title={s.title}
            caption={s.caption}
            selected={form.employmentStatus === s.code}
            onSelect={() => update({ employmentStatus: s.code })}
          />
        ))}
      </div>
      <div className="field">
        <label>Preferred job roles</label>
        <TagInput ariaLabel="Preferred job roles" values={form.roles} onChange={(roles) => update({ roles })} addLabel="Add role" max={20} />
      </div>
      <div className="grid-2">
        <div className="field">
          <label>Preferred locations</label>
          <TagInput ariaLabel="Preferred locations" values={form.locations} onChange={(locations) => update({ locations })} max={20} />
        </div>
        <div className="field">
          <label>Work type</label>
          <div className="opt-row" role="group" aria-label="Work type">
            {WORK_TYPES.map((t) => (
              <OptionPill key={t} label={WORK_TYPE_LABELS[t]} square selected={form.workTypes.includes(t)} onSelect={() => toggleWorkType(t)} />
            ))}
          </div>
        </div>
        <FieldShell id="pref-salary" label="Expected salary (per year)" error={salaryError ?? apiError?.fieldErrors.minimum_salary}>
          <InputBox
            error={salaryError ?? undefined}
            leading={
              <span className="cc">
                <select aria-label="Salary currency" value={form.currency} onChange={(e) => update({ currency: e.target.value })}>
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </span>
            }
          >
            <input
              id="pref-salary"
              inputMode="numeric"
              placeholder="12,00,000 – 18,00,000"
              value={form.salary}
              onChange={(e) => update({ salary: e.target.value })}
            />
          </InputBox>
        </FieldShell>
        <SelectField
          id="pref-notice"
          label="Notice period"
          icon={Calendar}
          options={NOTICE}
          placeholder="Select"
          value={form.notice}
          onChange={(e) => update({ notice: e.target.value })}
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
