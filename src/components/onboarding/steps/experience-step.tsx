"use client";

import { Briefcase, Building, Calendar, CircleCheck, MapPin, Pencil, Plus, Sparkles, Trash } from "lucide-react";
import { useState } from "react";
import { FieldShell, InputBox, SelectField, TextField } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { usePreferences, useReplaceList, useSetupList } from "@/hooks/use-profile-setup";
import { ApiError } from "@/lib/api/errors";
import { countryName } from "@/lib/profile/countries";
import { parseLocation } from "@/lib/profile/location";
import { EMPLOYMENT_TYPE_LABELS, codeFor, fromMonth, monthLabel, toMonth } from "@/lib/profile/setup-options";
import type { Experience, ListInput } from "@/types/api";
import { OnboardingFooter, OnboardingShell } from "../onboarding-shell";
import { useStepNav } from "../use-step-nav";

const TYPES = Object.values(EMPLOYMENT_TYPE_LABELS);

interface Role {
  key: string;
  id?: string;
  company: string;
  title: string;
  employmentType: string;
  start: string;
  end: string;
  current: boolean;
  location: string;
  responsibilities: string;
}

let nextKey = 0;
const blank = (): Role => ({
  key: `new-${++nextKey}`,
  company: "",
  title: "",
  employmentType: "Full-time",
  start: "",
  end: "",
  current: false,
  location: "",
  responsibilities: "",
});

function fromApi(e: Experience): Role {
  return {
    key: e.id,
    id: e.id,
    company: e.company_name,
    title: e.job_title,
    employmentType: e.employment_type ? EMPLOYMENT_TYPE_LABELS[e.employment_type] : "",
    start: toMonth(e.start_date),
    end: toMonth(e.end_date),
    current: e.is_current,
    location: [e.location_city, e.location_state, countryName(e.location_country)].filter(Boolean).join(", "),
    responsibilities: e.description ?? "",
  };
}

function toApi(r: Role): ListInput<Experience> {
  const loc = parseLocation(r.location);
  return {
    id: r.id,
    company_name: r.company.trim(),
    job_title: r.title.trim(),
    employment_type: codeFor(EMPLOYMENT_TYPE_LABELS, r.employmentType),
    work_arrangement: null,
    location_city: loc.city || null,
    location_state: loc.state_province || null,
    location_country: loc.country_code || null,
    start_date: fromMonth(r.start) ?? "",
    end_date: r.current ? null : fromMonth(r.end),
    is_current: r.current,
    description: r.responsibilities.trim() || null,
  };
}

function problems(r: Role): Partial<Record<"company" | "title" | "start" | "end", string>> {
  return {
    company: r.company.trim() ? undefined : "Required",
    title: r.title.trim() ? undefined : "Required",
    start: r.start ? undefined : "Required",
    end: !r.current && r.end && r.start && r.end < r.start ? "Must be after the start date" : undefined,
  };
}

/**
 * Step 3 — saved to user_experience. Experience level and employment status come from the
 * Preferences step; Freshers may skip this step.
 */
export function ExperienceStep() {
  const nav = useStepNav(2);
  const prefs = usePreferences();
  const saved = useSetupList("experience");
  const replace = useReplaceList("experience");
  const [edited, setEdited] = useState<Role[] | null>(null);
  const roles = edited ?? (saved.data ?? []).map(fromApi);
  const [editing, setEditing] = useState<Role>(blank);
  const [showErrors, setShowErrors] = useState(false);
  const fresher = prefs.data?.employment_status === "fresher";

  const set = (patch: Partial<Role>) => setEditing((e) => ({ ...e, ...patch }));
  const hasInput = Boolean(editing.company || editing.title || editing.start);
  const errors = showErrors ? problems(editing) : {};
  const isEdit = roles.some((r) => r.key === editing.key);

  /** Adds or updates the role in the form; returns the new list, or null when it's invalid. */
  const commit = (): Role[] | null => {
    if (Object.values(problems(editing)).some(Boolean)) {
      setShowErrors(true);
      return null;
    }
    const next = isEdit ? roles.map((r) => (r.key === editing.key ? editing : r)) : [...roles, editing];
    setEdited(next);
    setEditing(blank());
    setShowErrors(false);
    return next;
  };

  const persist = async (): Promise<boolean> => {
    let list = edited;
    if (hasInput) {
      list = commit();
      if (!list) return false;
    }
    if (!list) return true;
    try {
      await replace.mutateAsync(list.map(toApi));
      setEdited(null);
      return true;
    } catch {
      return false;
    }
  };

  const apiError = (replace.error ?? saved.error) instanceof ApiError ? ((replace.error ?? saved.error) as ApiError) : null;

  return (
    <OnboardingShell
      stepIndex={2}
      title={
        <>
          Your work <span className="hl">experience</span>
        </>
      }
      description="Add your roles. JobAI uses them to tailor every resume you send."
      onSaveExit={() => void nav.exit(persist)}
      onLeave={(href) => void nav.go(persist, href)}
      loading={saved.isPending || prefs.isPending}
      footer={
        <OnboardingFooter
          stepIndex={2}
          onBack={() => void nav.back(persist)}
          skip={fresher}
          onSkip={nav.skip}
          onContinue={() => void nav.next(persist)}
          loading={nav.busy || saved.isPending}
        />
      }
    >
      {apiError ? <Notice tone="err">{apiError.message}</Notice> : null}
      {fresher ? (
        <div className="ai-tip">
          <span className="tip-ic">
            <Sparkles className="ic ic-sm" />
          </span>
          <span>
            You&apos;re a <b>fresher</b>, so this step is optional. Add internships or part-time roles if you have any, or skip
            for now; JobAI will highlight your skills, projects and education instead.
          </span>
        </div>
      ) : null}

      {roles.length ? (
        <div className="level-row">
          <span className="ob-label" style={{ margin: 0 }}>
            Your roles
          </span>
          <button
            type="button"
            className="tag-add"
            style={{ marginLeft: "auto" }}
            onClick={() => (hasInput ? commit() : setEditing(blank()))}
          >
            <Plus className="ic" />
            Add another experience
          </button>
        </div>
      ) : null}

      {roles.map((exp) => (
        <div className="exp-card" key={exp.key}>
          <span className="co co-m" style={{ width: 44, height: 44, borderRadius: 12 }}>
            {exp.company[0]?.toUpperCase()}
          </span>
          <div className="exp-main">
            <b>{exp.title}</b>
            <small>
              {[
                exp.company,
                exp.employmentType,
                exp.start ? `${monthLabel(exp.start)} – ${exp.current ? "Present" : monthLabel(exp.end, "—")}` : null,
                exp.location,
              ]
                .filter(Boolean)
                .join(" · ")}
            </small>
          </div>
          <button type="button" className="exp-act" aria-label={`Edit ${exp.title}`} onClick={() => (setEditing(exp), setShowErrors(false))}>
            <Pencil className="ic ic-sm" />
          </button>
          <button
            type="button"
            className="exp-act"
            aria-label={`Delete ${exp.title}`}
            onClick={() => {
              setEdited(roles.filter((r) => r.key !== exp.key));
              if (editing.key === exp.key) setEditing(blank());
            }}
          >
            <Trash className="ic ic-sm" />
          </button>
        </div>
      ))}

      <div className="ob-label" style={{ display: "flex", justifyContent: "space-between" }}>
        {isEdit ? "Edit role" : editing.current ? "Current role" : "Role"}
        <button type="button" className="cur-flag link-btn" aria-pressed={editing.current} onClick={() => set({ current: !editing.current })}>
          <CircleCheck className="ic ic-xs" />
          {editing.current ? "I currently work here" : "Mark as current role"}
        </button>
      </div>
      <div className="grid-3">
        <TextField id="exp-company" label="Company name" required icon={Building} value={editing.company} onChange={(e) => set({ company: e.target.value })} error={errors.company} />
        <TextField id="exp-title" label="Job title" required icon={Briefcase} value={editing.title} onChange={(e) => set({ title: e.target.value })} error={errors.title} />
        <SelectField id="exp-type" label="Employment type" options={TYPES} value={editing.employmentType} onChange={(e) => set({ employmentType: e.target.value })} />
        <TextField id="exp-start" label="Start date" required icon={Calendar} type="month" value={editing.start} onChange={(e) => set({ start: e.target.value })} error={errors.start} />
        <TextField
          id="exp-end"
          label="End date"
          icon={Calendar}
          type={editing.current ? "text" : "month"}
          state={editing.current ? "locked" : ""}
          placeholder="Present"
          readOnly={editing.current}
          value={editing.current ? "" : editing.end}
          onChange={(e) => set({ end: e.target.value })}
          error={errors.end}
        />
        <TextField id="exp-location" label="Location" icon={MapPin} placeholder="Pune, Maharashtra, India" value={editing.location} onChange={(e) => set({ location: e.target.value })} />
      </div>
      <FieldShell id="exp-resp" label="Key responsibilities">
        <InputBox boxClassName="textarea">
          <textarea
            id="exp-resp"
            maxLength={5000}
            placeholder="What did you own, ship or improve?"
            value={editing.responsibilities}
            onChange={(e) => set({ responsibilities: e.target.value })}
          />
        </InputBox>
      </FieldShell>
      {isEdit ? (
        <Button type="button" variant="ghost" size="xs" onClick={commit}>
          Update role
        </Button>
      ) : null}
    </OnboardingShell>
  );
}
