"use client";

import { Award, GraduationCap, Languages, Pencil, Plus, ShieldCheck, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SelectField, TextField } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import { useOnboardingStore, type Education } from "@/stores/onboarding-store";
import { Switch, TagInput } from "../controls";
import { OnboardingFooter, OnboardingShell } from "../onboarding-shell";
import { stepHref } from "../steps";

const GAPS = ["None", "Less than 6 months", "6–12 months", "More than a year"] as const;
const AUTH = ["Citizen", "Permanent resident", "Work visa", "Require sponsorship"] as const;
const RELOCATE = ["Yes, anywhere", "Yes, within my country", "No"] as const;

export function AdditionalStep() {
  const router = useRouter();
  const { draft, update } = useOnboardingStore();
  const [edu, setEdu] = useState<Education | null>(null);

  const saveEdu = () => {
    if (!edu || !edu.degree.trim() || !edu.school.trim()) return;
    const exists = draft.education.some((e) => e.id === edu.id);
    update({ education: exists ? draft.education.map((e) => (e.id === edu.id ? edu : e)) : [...draft.education, edu] });
    setEdu(null);
  };

  return (
    <OnboardingShell
      stepIndex={5}
      title={
        <>
          Additional <span className="hl">information</span>
        </>
      }
      description="A few more details to round out your profile."
      footer={
        <OnboardingFooter stepIndex={5} skip continueLabel="Finish Setup" onContinue={() => router.push(stepHref(6))} />
      }
    >
      <div className="grid-2">
        <div className="field">
          <label>
            <span className="lbl-ic">
              <Languages className="ic ic-xs" />
              Languages known
            </span>
          </label>
          <TagInput ariaLabel="Languages known" values={draft.languages} onChange={(languages) => update({ languages })} placeholder="English · Native" />
        </div>
        <div className="field">
          <label>
            <span className="lbl-ic">
              <Award className="ic ic-xs" />
              Certifications <em>(optional)</em>
            </span>
          </label>
          <TagInput ariaLabel="Certifications" values={draft.certifications} onChange={(certifications) => update({ certifications })} />
        </div>
      </div>
      <div className="ob-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Education
        {!edu ? (
          <button type="button" className="tag-add" onClick={() => setEdu({ id: crypto.randomUUID(), degree: "", school: "", years: "" })}>
            <Plus className="ic" />
            Add education
          </button>
        ) : null}
      </div>
      {draft.education.map((e) => (
        <div className="exp-card" key={e.id}>
          <span className="oc-ic" style={{ width: 44, height: 44 }}>
            <GraduationCap className="ic ic-sm" />
          </span>
          <div className="exp-main">
            <b>{e.degree}</b>
            <small>{[e.school, e.years].filter(Boolean).join(" · ")}</small>
          </div>
          <button type="button" className="exp-act" aria-label={`Edit ${e.degree}`} onClick={() => setEdu(e)}>
            <Pencil className="ic ic-sm" />
          </button>
          <button
            type="button"
            className="exp-act"
            aria-label={`Delete ${e.degree}`}
            onClick={() => update({ education: draft.education.filter((x) => x.id !== e.id) })}
          >
            <Trash className="ic ic-sm" />
          </button>
        </div>
      ))}
      {edu ? (
        <div className="grid-3" style={{ alignItems: "end" }}>
          <TextField id="edu-degree" label="Degree" value={edu.degree} placeholder="B.Des, Interaction Design" onChange={(e) => setEdu({ ...edu, degree: e.target.value })} />
          <TextField id="edu-school" label="School" value={edu.school} placeholder="UC Berkeley" onChange={(e) => setEdu({ ...edu, school: e.target.value })} />
          <TextField
            id="edu-years"
            label="Years"
            value={edu.years}
            placeholder="2015 – 2019"
            onChange={(e) => setEdu({ ...edu, years: e.target.value })}
            trailing={
              <Button type="button" size="xs" onClick={saveEdu} disabled={!edu.degree.trim() || !edu.school.trim()}>
                Save
              </Button>
            }
          />
        </div>
      ) : null}
      <div className="grid-3">
        <SelectField id="add-gaps" label={<>Career gaps <em>(optional)</em></>} options={GAPS} value={draft.careerGaps} onChange={(e) => update({ careerGaps: e.target.value })} />
        <SelectField id="add-auth" label="Work authorization" icon={ShieldCheck} options={AUTH} placeholder="Select" value={draft.workAuthorization} onChange={(e) => update({ workAuthorization: e.target.value })} />
        <SelectField id="add-relocate" label="Willing to relocate" options={RELOCATE} placeholder="Select" value={draft.relocate} onChange={(e) => update({ relocate: e.target.value })} />
      </div>
      <div className="toggles">
        <div className="toggle-row">
          <div>
            <b>Let recruiters find my profile</b>
            <small>Recruiters can invite you to apply</small>
          </div>
          <Switch label="Let recruiters find my profile" checked={draft.discoverable} onChange={(discoverable) => update({ discoverable })} />
        </div>
        <div className="toggle-row">
          <div>
            <b>Daily job-match digest</b>
            <small>Your top 5 new matches each morning</small>
          </div>
          <Switch label="Daily job-match digest" checked={draft.dailyDigest} onChange={(dailyDigest) => update({ dailyDigest })} />
        </div>
      </div>
    </OnboardingShell>
  );
}
