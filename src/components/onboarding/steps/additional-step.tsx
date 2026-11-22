"use client";

import { Award, GraduationCap, Languages, Pencil, Plus, ShieldCheck, Trash, X } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { SelectField, TextField } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";
import { usePreferences, useReplaceList, useSetupList, useUpdatePreferences } from "@/hooks/use-profile-setup";
import { ApiError } from "@/lib/api/errors";
import { COUNTRIES, countryName } from "@/lib/profile/countries";
import { linkSchema } from "@/lib/profile/schema";
import {
  CAREER_GAP_LABELS,
  EDUCATION_LEVEL_LABELS,
  PROFICIENCY_LABELS,
  WORK_AUTH_LABELS,
  codeFor,
  formatYears,
  fromMonth,
  monthLabel,
  parseYears,
  toMonth,
} from "@/lib/profile/setup-options";
import type {
  Certification,
  Education,
  Language,
  LanguageProficiency,
  ListInput,
  Preferences,
  Profile,
  ProfileUpdate,
} from "@/types/api";
import { Switch } from "../controls";
import { OnboardingFooter, OnboardingShell } from "../onboarding-shell";
import { useStepNav } from "../use-step-nav";

const GAPS = Object.values(CAREER_GAP_LABELS);
const AUTH = Object.values(WORK_AUTH_LABELS);
const LEVELS = Object.values(EDUCATION_LEVEL_LABELS);
const RELOCATE = ["Yes", "No"] as const;
const COUNTRY_NAMES = COUNTRIES.map((c) => c.name);

type Keyed<T extends { id: string }> = ListInput<T> & { key: string };
type Lang = Keyed<Language>;
type Cert = Keyed<Certification>;
interface Edu {
  key: string;
  id?: string;
  level: string;
  degree: string;
  school: string;
  years: string;
  /** The saved row, so years the text box can't express (end only, undated "currently studying") survive a save. */
  saved?: Education;
}

const keyed = <T extends { id: string }>(rows: T[] | undefined): Keyed<T>[] => (rows ?? []).map((r) => ({ ...r, key: r.id }));
function strip<T extends { key: string }>(item: T): Omit<T, "key"> {
  const rest: Partial<T> = { ...item };
  delete rest.key;
  return rest as Omit<T, "key">;
}

const eduFromApi = (e: Education): Edu => ({
  key: e.id,
  id: e.id,
  level: EDUCATION_LEVEL_LABELS[e.education_level],
  degree: e.degree_name,
  school: e.institution_name,
  years: formatYears(e.start_year, e.end_year, e.is_currently_studying),
  saved: e,
});

const blankCert = (): Cert => ({
  key: crypto.randomUUID(),
  certification_name: "",
  issuing_organization: null,
  issue_date: null,
  expiry_date: null,
  credential_id: null,
  credential_url: null,
});

interface Details {
  careerGap: string;
  relocate: string;
  authStatus: string;
  authCountry: string;
  recruiters: boolean;
  digest: boolean;
  sponsorship: boolean;
}

function toDetails(profile: Profile | null | undefined, prefs: Preferences | undefined): Details {
  return {
    careerGap: profile?.career_gap ? CAREER_GAP_LABELS[profile.career_gap] : "",
    relocate: prefs?.willing_to_relocate === true ? "Yes" : prefs?.willing_to_relocate === false ? "No" : "",
    authStatus: profile?.work_authorization_status ? WORK_AUTH_LABELS[profile.work_authorization_status] : "",
    authCountry: countryName(profile?.work_authorization_country ?? profile?.country_code) ?? "",
    recruiters: prefs?.recruiter_visibility ?? false,
    digest: prefs?.daily_job_match_digest ?? false,
    sponsorship: prefs?.requires_visa_sponsorship ?? false,
  };
}

/** "English · Native" chips with an inline language + proficiency entry. */
function LanguageInput({ values, onChange }: { values: Lang[]; onChange: (v: Lang[]) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [level, setLevel] = useState<LanguageProficiency>("professional");

  const add = () => {
    const value = name.trim();
    if (value && !values.some((l) => l.language_name.toLowerCase() === value.toLowerCase())) {
      onChange([...values, { key: crypto.randomUUID(), language_name: value, proficiency_level: level }]);
    }
    setName("");
  };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      add();
    } else if (e.key === "Escape") {
      setName("");
      setOpen(false);
    }
  };

  return (
    <div className="tags" role="group" aria-label="Languages known">
      {values.map((l) => (
        <span className="tag" key={l.key}>
          {l.language_name} · {PROFICIENCY_LABELS[l.proficiency_level]}
          <button type="button" onClick={() => onChange(values.filter((x) => x.key !== l.key))} aria-label={`Remove ${l.language_name}`}>
            <X className="ic" />
          </button>
        </span>
      ))}
      {open && values.length < 20 ? (
        <>
          <input autoFocus value={name} placeholder="Language" aria-label="Language" maxLength={100} onChange={(e) => setName(e.target.value)} onKeyDown={onKeyDown} />
          <select
            aria-label="Proficiency"
            className="tag-add"
            value={level}
            onChange={(e) => setLevel(e.target.value as LanguageProficiency)}
          >
            {(Object.keys(PROFICIENCY_LABELS) as LanguageProficiency[]).map((p) => (
              <option key={p} value={p}>
                {PROFICIENCY_LABELS[p]}
              </option>
            ))}
          </select>
          <Button type="button" size="xs" onClick={add} disabled={!name.trim()}>
            Add
          </Button>
        </>
      ) : values.length < 20 ? (
        <button type="button" className="tag-add" onClick={() => setOpen(true)}>
          <Plus className="ic" />
          Add language
        </button>
      ) : null}
    </div>
  );
}

/** Step 6 — education, certifications and languages lists; work authorization and career gap on the profile; the rest in job_preferences. */
export function AdditionalStep() {
  const nav = useStepNav(5);
  const profile = useProfile();
  const prefs = usePreferences();
  const savedLangs = useSetupList("languages");
  const savedCerts = useSetupList("certifications");
  const savedEdu = useSetupList("education");
  const replaceLangs = useReplaceList("languages");
  const replaceCerts = useReplaceList("certifications");
  const replaceEdu = useReplaceList("education");
  const updateProfile = useUpdateProfile();
  const updatePrefs = useUpdatePreferences();

  const [langsEdited, setLangs] = useState<Lang[] | null>(null);
  const [certsEdited, setCerts] = useState<Cert[] | null>(null);
  const [eduEdited, setEducation] = useState<Edu[] | null>(null);
  const [detailsEdited, setDetails] = useState<Details | null>(null);
  const langs = langsEdited ?? keyed(savedLangs.data);
  const certs = certsEdited ?? keyed(savedCerts.data);
  const education = eduEdited ?? (savedEdu.data ?? []).map(eduFromApi);
  const details = detailsEdited ?? toDetails(profile.data, prefs.data);
  const setDetail = (patch: Partial<Details>) => setDetails({ ...details, ...patch });

  const [edu, setEdu] = useState<Edu | null>(null);
  const [eduError, setEduError] = useState<string | null>(null);
  const [cert, setCert] = useState<Cert | null>(null);
  const [certError, setCertError] = useState<string | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const saveEdu = () => {
    if (!edu) return;
    if (!edu.level || !edu.degree.trim() || !edu.school.trim()) return setEduError("Education level, degree and school are required");
    const years = parseYears(edu.years);
    if (!years) return setEduError("Enter years like 2015 – 2019 or 2024 – Present");
    if (years.start && years.end && years.end < years.start) return setEduError("The end year must not be before the start year");
    const exists = education.some((e) => e.key === edu.key);
    setEducation(exists ? education.map((e) => (e.key === edu.key ? edu : e)) : [...education, edu]);
    setEdu(null);
    setEduError(null);
  };

  const saveCert = () => {
    if (!cert) return;
    if (!cert.certification_name.trim()) return setCertError("Certification name is required");
    if (cert.issue_date && cert.expiry_date && cert.expiry_date < cert.issue_date) return setCertError("The expiry date must not be before the issue date");
    const link = cert.credential_url?.trim() ? (/^https?:\/\//i.test(cert.credential_url.trim()) ? cert.credential_url.trim() : `https://${cert.credential_url.trim()}`) : null;
    if (link && !linkSchema.safeParse(link).success) return setCertError("Enter a valid credential URL");
    const next = { ...cert, credential_url: link };
    const exists = certs.some((c) => c.key === cert.key);
    setCerts(exists ? certs.map((c) => (c.key === cert.key ? next : c)) : [...certs, next]);
    setCert(null);
    setCertError(null);
  };

  const persist = async (): Promise<boolean> => {
    if (edu || cert) {
      setError(new ApiError("Save or cancel the open education or certification entry first.", 422, "unsaved"));
      return false;
    }
    setError(null);
    const tasks: Promise<unknown>[] = [];
    if (langsEdited) tasks.push(replaceLangs.mutateAsync(langsEdited.map(strip)));
    if (certsEdited) tasks.push(replaceCerts.mutateAsync(certsEdited.map(strip)));
    if (eduEdited) {
      tasks.push(
        replaceEdu.mutateAsync(
          eduEdited.map((e) => {
            const s = e.saved;
            const years =
              s && e.years === formatYears(s.start_year, s.end_year, s.is_currently_studying)
                ? { start: s.start_year, end: s.end_year, current: s.is_currently_studying }
                : (parseYears(e.years) ?? { start: null, end: null, current: false });
            return {
              id: e.id,
              education_level: codeFor(EDUCATION_LEVEL_LABELS, e.level) ?? "other",
              degree_name: e.degree.trim(),
              institution_name: e.school.trim(),
              start_year: years.start,
              end_year: years.end,
              is_currently_studying: years.current,
            };
          }),
        ),
      );
    }
    if (detailsEdited) {
      const current = profile.data;
      if (current) {
        const patch: ProfileUpdate = {};
        const gap = codeFor(CAREER_GAP_LABELS, details.careerGap);
        const status = codeFor(WORK_AUTH_LABELS, details.authStatus);
        const country = COUNTRIES.find((c) => c.name === details.authCountry)?.code ?? null;
        if (gap !== current.career_gap) patch.career_gap = gap;
        if (status !== current.work_authorization_status) patch.work_authorization_status = status;
        if (country !== current.work_authorization_country) patch.work_authorization_country = country;
        if (Object.keys(patch).length) tasks.push(updateProfile.mutateAsync(patch));
      }
      tasks.push(
        updatePrefs.mutateAsync({
          willing_to_relocate: details.relocate ? details.relocate === "Yes" : null,
          requires_visa_sponsorship: details.sponsorship,
          recruiter_visibility: details.recruiters,
          daily_job_match_digest: details.digest,
        }),
      );
    }
    const results = await Promise.allSettled(tasks);
    const failed = results.find((r): r is PromiseRejectedResult => r.status === "rejected");
    if (failed) {
      setError(failed.reason instanceof ApiError ? failed.reason : new ApiError("Something went wrong. Please try again.", 0, "unknown"));
      return false;
    }
    setLangs(null);
    setCerts(null);
    setEducation(null);
    setDetails(null);
    return true;
  };

  const loading = savedLangs.isPending || savedCerts.isPending || savedEdu.isPending || prefs.isPending || profile.isPending;

  return (
    <OnboardingShell
      stepIndex={5}
      title={
        <>
          Additional <span className="hl">information</span>
        </>
      }
      description="A few more details to round out your profile."
      onSaveExit={() => void nav.exit(persist)}
      onLeave={(href) => void nav.go(persist, href)}
      loading={loading}
      footer={
        <OnboardingFooter
          stepIndex={5}
          onBack={() => void nav.back(persist)}
          skip
          onSkip={nav.skip}
          continueLabel="Finish Setup"
          onContinue={() => void nav.next(persist)}
          loading={nav.busy || loading}
        />
      }
    >
      {error ? <Notice tone="err">{error.message}</Notice> : null}
      {!profile.isPending && !profile.data ? (
        <Notice tone="info">Complete Basic Info first so we can save your work authorization and career gap.</Notice>
      ) : null}
      <div className="field">
        <label>
          <span className="lbl-ic">
            <Languages className="ic ic-xs" />
            Languages known
          </span>
        </label>
        <LanguageInput values={langs} onChange={setLangs} />
      </div>

      <div className="ob-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="lbl-ic">
          <Award className="ic ic-xs" />
          Certifications <em>(optional)</em>
        </span>
        {!cert ? (
          <button type="button" className="tag-add" onClick={() => setCert(blankCert())}>
            <Plus className="ic" />
            Add certification
          </button>
        ) : null}
      </div>
      {certs.map((c) => (
        <div className="exp-card" key={c.key}>
          <span className="oc-ic" style={{ width: 44, height: 44 }}>
            <Award className="ic ic-sm" />
          </span>
          <div className="exp-main">
            <b>{c.certification_name}</b>
            <small>
              {[
                c.issuing_organization,
                c.issue_date ? `Issued ${monthLabel(c.issue_date)}` : null,
                c.expiry_date ? `Expires ${monthLabel(c.expiry_date)}` : null,
                c.credential_id ? `ID ${c.credential_id}` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </small>
          </div>
          <button type="button" className="exp-act" aria-label={`Edit ${c.certification_name}`} onClick={() => setCert(c)}>
            <Pencil className="ic ic-sm" />
          </button>
          <button type="button" className="exp-act" aria-label={`Delete ${c.certification_name}`} onClick={() => setCerts(certs.filter((x) => x.key !== c.key))}>
            <Trash className="ic ic-sm" />
          </button>
        </div>
      ))}
      {cert ? (
        <>
          <div className="grid-3">
            <TextField id="cert-name" label="Certification name" required value={cert.certification_name} placeholder="AWS Certified Developer" maxLength={250} onChange={(e) => setCert({ ...cert, certification_name: e.target.value })} />
            <TextField id="cert-issuer" label="Issuing organization" value={cert.issuing_organization ?? ""} placeholder="Amazon Web Services" maxLength={250} onChange={(e) => setCert({ ...cert, issuing_organization: e.target.value || null })} />
            <TextField id="cert-id" label="Credential ID" value={cert.credential_id ?? ""} placeholder="Optional" maxLength={200} onChange={(e) => setCert({ ...cert, credential_id: e.target.value || null })} />
            <TextField id="cert-issued" label="Issue date" type="month" value={toMonth(cert.issue_date)} onChange={(e) => setCert({ ...cert, issue_date: fromMonth(e.target.value) })} />
            <TextField id="cert-expires" label="Expiry date" type="month" value={toMonth(cert.expiry_date)} onChange={(e) => setCert({ ...cert, expiry_date: fromMonth(e.target.value) })} />
            <TextField id="cert-url" label="Credential URL" value={cert.credential_url ?? ""} placeholder="Verification link (optional)" onChange={(e) => setCert({ ...cert, credential_url: e.target.value || null })} />
          </div>
          {certError ? <div className="field-err">{certError}</div> : null}
          <div style={{ display: "flex", gap: 8 }}>
            <Button type="button" size="xs" onClick={saveCert}>
              Save
            </Button>
            <Button type="button" size="xs" variant="ghost" onClick={() => (setCert(null), setCertError(null))}>
              Cancel
            </Button>
          </div>
        </>
      ) : null}

      <div className="ob-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        Education
        {!edu ? (
          <button type="button" className="tag-add" onClick={() => setEdu({ key: crypto.randomUUID(), level: "", degree: "", school: "", years: "" })}>
            <Plus className="ic" />
            Add education
          </button>
        ) : null}
      </div>
      {education.map((e) => (
        <div className="exp-card" key={e.key}>
          <span className="oc-ic" style={{ width: 44, height: 44 }}>
            <GraduationCap className="ic ic-sm" />
          </span>
          <div className="exp-main">
            <b>{e.degree}</b>
            <small>{[e.level, e.school, e.years].filter(Boolean).join(" · ")}</small>
          </div>
          <button type="button" className="exp-act" aria-label={`Edit ${e.degree}`} onClick={() => setEdu(e)}>
            <Pencil className="ic ic-sm" />
          </button>
          <button type="button" className="exp-act" aria-label={`Delete ${e.degree}`} onClick={() => setEducation(education.filter((x) => x.key !== e.key))}>
            <Trash className="ic ic-sm" />
          </button>
        </div>
      ))}
      {edu ? (
        <>
          <div className="grid-2">
            <SelectField id="edu-level" label="Education level" required options={LEVELS} placeholder="Select" value={edu.level} onChange={(e) => setEdu({ ...edu, level: e.target.value })} />
            <TextField id="edu-degree" label="Degree" required value={edu.degree} placeholder="B.Des, Interaction Design" maxLength={200} onChange={(e) => setEdu({ ...edu, degree: e.target.value })} />
            <TextField id="edu-school" label="School" required value={edu.school} placeholder="UC Berkeley" maxLength={250} onChange={(e) => setEdu({ ...edu, school: e.target.value })} />
            <TextField id="edu-years" label="Years" value={edu.years} placeholder="2015 – 2019" onChange={(e) => setEdu({ ...edu, years: e.target.value })} />
          </div>
          {eduError ? <div className="field-err">{eduError}</div> : null}
          <div style={{ display: "flex", gap: 8 }}>
            <Button type="button" size="xs" onClick={saveEdu}>
              Save
            </Button>
            <Button type="button" size="xs" variant="ghost" onClick={() => (setEdu(null), setEduError(null))}>
              Cancel
            </Button>
          </div>
        </>
      ) : null}

      <div className="grid-2">
        <SelectField id="add-gaps" label={<>Career gaps <em>(optional)</em></>} options={GAPS} placeholder="Select" value={details.careerGap} onChange={(e) => setDetail({ careerGap: e.target.value })} />
        <SelectField id="add-relocate" label="Willing to relocate" options={RELOCATE} placeholder="Select" value={details.relocate} onChange={(e) => setDetail({ relocate: e.target.value })} />
        <SelectField id="add-auth" label="Work authorization" icon={ShieldCheck} options={AUTH} placeholder="Select" value={details.authStatus} onChange={(e) => setDetail({ authStatus: e.target.value })} />
        <SelectField id="add-auth-country" label="Authorized to work in" options={COUNTRY_NAMES} placeholder="Select" value={details.authCountry} onChange={(e) => setDetail({ authCountry: e.target.value })} />
      </div>
      <div className="toggles">
        <div className="toggle-row">
          <div>
            <b>I need visa sponsorship</b>
            <small>Only match jobs that can sponsor a work visa</small>
          </div>
          <Switch label="I need visa sponsorship" checked={details.sponsorship} onChange={(sponsorship) => setDetail({ sponsorship })} />
        </div>
        <div className="toggle-row">
          <div>
            <b>Let recruiters find my profile</b>
            <small>Recruiters can invite you to apply</small>
          </div>
          <Switch label="Let recruiters find my profile" checked={details.recruiters} onChange={(recruiters) => setDetail({ recruiters })} />
        </div>
        <div className="toggle-row">
          <div>
            <b>Daily job-match digest</b>
            <small>Your top 5 new matches each morning</small>
          </div>
          <Switch label="Daily job-match digest" checked={details.digest} onChange={(digest) => setDetail({ digest })} />
        </div>
      </div>
    </OnboardingShell>
  );
}
