"use client";

import { Briefcase, Building, Calendar, CircleCheck, MapPin, Pencil, Plus, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SelectField, TextField, FieldShell, InputBox } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import { useOnboardingStore, type Experience } from "@/stores/onboarding-store";
import { OptionPill } from "../controls";
import { OnboardingFooter, OnboardingShell } from "../onboarding-shell";
import { stepHref } from "../steps";

const TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Freelance"] as const;

const blank = (): Experience => ({
  id: "",
  company: "",
  title: "",
  employmentType: "Full-time",
  start: "",
  end: "",
  location: "",
  responsibilities: "",
});

function monthLabel(value: string) {
  if (!value) return "Present";
  const [y, m] = value.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function ExperienceStep() {
  const router = useRouter();
  const { draft, update } = useOnboardingStore();
  const [editing, setEditing] = useState<Experience>(() => blank());
  const [current, setCurrent] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const set = (patch: Partial<Experience>) => setEditing((e) => ({ ...e, ...patch }));
  const hasInput = Boolean(editing.company || editing.title);

  const save = () => {
    if (!editing.company.trim() || !editing.title.trim()) {
      setError("Company name and job title are required");
      return false;
    }
    const entry = { ...editing, id: editing.id || crypto.randomUUID(), end: current ? "" : editing.end };
    const exists = draft.experiences.some((e) => e.id === entry.id);
    update({ experiences: exists ? draft.experiences.map((e) => (e.id === entry.id ? entry : e)) : [...draft.experiences, entry] });
    setEditing(blank());
    setCurrent(false);
    setError(null);
    return true;
  };

  const next = () => {
    if (draft.experienceLevel === "experienced" && hasInput && !save()) return;
    router.push(stepHref(3));
  };

  return (
    <OnboardingShell
      stepIndex={2}
      title={
        <>
          Your work <span className="hl">experience</span>
        </>
      }
      description="Add your roles. JobAI uses them to tailor every resume you send."
      footer={<OnboardingFooter stepIndex={2} onContinue={next} />}
    >
      <div className="level-row">
        <span className="ob-label" style={{ margin: 0 }}>
          Your experience level
        </span>
        <div className="opt-row" role="radiogroup" aria-label="Experience level">
          <OptionPill label="Fresher" selected={draft.experienceLevel === "fresher"} onSelect={() => update({ experienceLevel: "fresher" })} />
          <OptionPill
            label="Experienced"
            selected={draft.experienceLevel === "experienced"}
            onSelect={() => update({ experienceLevel: "experienced" })}
          />
        </div>
        {draft.experienceLevel === "experienced" ? (
          <button type="button" className="tag-add" style={{ marginLeft: "auto" }} onClick={() => hasInput && save()}>
            <Plus className="ic" />
            Add another experience
          </button>
        ) : null}
      </div>

      {draft.experiences.map((exp) => (
        <div className="exp-card" key={exp.id}>
          <span className="co co-m" style={{ width: 44, height: 44, borderRadius: 12 }}>
            {exp.company[0]?.toUpperCase()}
          </span>
          <div className="exp-main">
            <b>{exp.title}</b>
            <small>
              {[exp.company, exp.employmentType, exp.start ? `${monthLabel(exp.start)} – ${monthLabel(exp.end)}` : null, exp.location]
                .filter(Boolean)
                .join(" · ")}
            </small>
          </div>
          <button type="button" className="exp-act" aria-label={`Edit ${exp.title}`} onClick={() => (setEditing(exp), setCurrent(!exp.end))}>
            <Pencil className="ic ic-sm" />
          </button>
          <button
            type="button"
            className="exp-act"
            aria-label={`Delete ${exp.title}`}
            onClick={() => update({ experiences: draft.experiences.filter((e) => e.id !== exp.id) })}
          >
            <Trash className="ic ic-sm" />
          </button>
        </div>
      ))}

      {draft.experienceLevel === "experienced" ? (
        <>
          <div className="ob-label" style={{ display: "flex", justifyContent: "space-between" }}>
            {current ? "Current role" : "Role"}
            <button type="button" className="cur-flag link-btn" aria-pressed={current} onClick={() => setCurrent((c) => !c)}>
              <CircleCheck className="ic ic-xs" />
              {current ? "I currently work here" : "Mark as current role"}
            </button>
          </div>
          <div className="grid-3">
            <TextField id="exp-company" label="Company name" icon={Building} value={editing.company} onChange={(e) => set({ company: e.target.value })} error={error && !editing.company.trim() ? "Required" : undefined} />
            <TextField id="exp-title" label="Job title" icon={Briefcase} value={editing.title} onChange={(e) => set({ title: e.target.value })} error={error && !editing.title.trim() ? "Required" : undefined} />
            <SelectField id="exp-type" label="Employment type" options={TYPES} value={editing.employmentType} onChange={(e) => set({ employmentType: e.target.value })} />
            <TextField id="exp-start" label="Start date" icon={Calendar} type="month" value={editing.start} onChange={(e) => set({ start: e.target.value })} />
            <TextField
              id="exp-end"
              label="End date"
              icon={Calendar}
              type={current ? "text" : "month"}
              state={current ? "locked" : ""}
              placeholder="Present"
              value={current ? "" : editing.end}
              onChange={(e) => set({ end: e.target.value })}
            />
            <TextField id="exp-location" label="Location" icon={MapPin} placeholder="Remote · US" value={editing.location} onChange={(e) => set({ location: e.target.value })} />
          </div>
          <FieldShell id="exp-resp" label="Key responsibilities">
            <InputBox boxClassName="textarea">
              <textarea
                id="exp-resp"
                maxLength={2000}
                placeholder="What did you own, ship or improve?"
                value={editing.responsibilities}
                onChange={(e) => set({ responsibilities: e.target.value })}
              />
            </InputBox>
          </FieldShell>
          {draft.experiences.some((e) => e.id === editing.id) ? (
            <Button type="button" variant="ghost" size="xs" onClick={save}>
              Save changes
            </Button>
          ) : null}
        </>
      ) : (
        <div className="ai-tip">
          <span className="tip-ic">
            <CircleCheck className="ic ic-sm" />
          </span>
          <span>No problem — JobAI will highlight your skills, projects and education instead.</span>
        </div>
      )}
    </OnboardingShell>
  );
}
