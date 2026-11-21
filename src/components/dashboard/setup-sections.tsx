"use client";

import { Award, Briefcase, Code, GraduationCap, Pencil, Target, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { stepHref } from "@/components/onboarding/steps";
import { usePreferences, useSetupList, useSkills } from "@/hooks/use-profile-setup";
import { countryName } from "@/lib/profile/countries";
import {
  CAREER_GAP_LABELS,
  EDUCATION_LEVEL_LABELS,
  EMPLOYMENT_STATUS_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  NOTICE_PERIODS,
  PROFICIENCY_LABELS,
  WORK_AUTH_LABELS,
  WORK_TYPE_LABELS,
  experienceLabel,
  formatSalary,
  formatYears,
  monthLabel,
} from "@/lib/profile/setup-options";
import type { Profile } from "@/types/api";

function SetupCard({
  id,
  title,
  caption,
  icon: Icon,
  step,
  children,
}: {
  id: string;
  title: string;
  caption: string;
  icon: LucideIcon;
  step: number;
  children: ReactNode;
}) {
  return (
    <section className="card sec-card" id={`section-${id}`} aria-labelledby={`section-${id}-title`}>
      <div className="sec-head">
        <h3 id={`section-${id}-title`}>
          <span className="oc-ic">
            <Icon className="ic ic-sm" />
          </span>
          <span>
            {title}
            <small>{caption}</small>
          </span>
        </h3>
        <Link className="btn btn-ghost btn-xs" href={stepHref(step)} aria-label={`Edit ${title}`}>
          <Pencil className="ic ic-sm" />
          Edit
        </Link>
      </div>
      {children}
    </section>
  );
}

function Info({ label, value, full }: { label: string; value: ReactNode; full?: boolean }) {
  const empty = value === null || value === undefined || value === "" || (Array.isArray(value) && !value.length);
  return (
    <div className="info" style={full ? { gridColumn: "1 / -1" } : undefined}>
      <dt>{label}</dt>
      <dd className={empty ? "empty" : undefined}>{empty ? "Not added yet" : value}</dd>
    </div>
  );
}

const yesNo = (v: boolean | null | undefined) => (v === true ? "Yes" : v === false ? "No" : null);
const join = (items: (string | null | undefined)[]) => items.filter(Boolean).join(" · ");

function Rows({ rows }: { rows: { key: string; title: string; detail: string }[] }) {
  if (!rows.length) return <p style={{ margin: 0, fontSize: 14.5, color: "#A3ABA6", fontWeight: 500 }}>Not added yet</p>;
  return (
    <>
      {rows.map((r) => (
        <div className="exp-card" key={r.key}>
          <div className="exp-main">
            <b>{r.title}</b>
            <small>{r.detail}</small>
          </div>
        </div>
      ))}
    </>
  );
}

/** Read-only summary of the onboarding answers; each card's Edit reopens that setup step. */
export function SetupSections({ profile }: { profile: Profile }) {
  const prefs = usePreferences().data;
  const skills = useSkills().data ?? [];
  const experience = useSetupList("experience").data ?? [];
  const education = useSetupList("education").data ?? [];
  const certifications = useSetupList("certifications").data ?? [];
  const languages = useSetupList("languages").data ?? [];
  const salary =
    prefs?.minimum_salary !== null && prefs?.minimum_salary !== undefined
      ? `${prefs.salary_currency} ${[prefs.minimum_salary, prefs.maximum_salary]
          .filter((n): n is number => n !== null)
          .map((n) => formatSalary(n, prefs.salary_currency))
          .join(" – ")} / year`
      : null;
  const skillsOf = (c: string) => skills.filter((s) => (s.category ?? "technical") === c).map((s) => s.name).join(", ");

  return (
    <>
      <SetupCard id="preferences" title="Career preferences" caption="What JobAI matches you with" icon={Target} step={1}>
        <dl className="info-grid">
          <Info label="Employment status" value={prefs?.employment_status ? EMPLOYMENT_STATUS_LABELS[prefs.employment_status] : null} />
          <Info label="Total experience" value={experienceLabel(profile.total_experience_years)} />
          <Info label="Preferred roles" value={prefs?.preferred_job_titles.join(", ")} />
          <Info label="Preferred locations" value={prefs?.preferred_locations.join(", ")} />
          <Info label="Work type" value={prefs?.preferred_work_types.map((t) => WORK_TYPE_LABELS[t]).join(", ")} />
          <Info label="Expected salary" value={salary} />
          <Info label="Notice period" value={NOTICE_PERIODS.find((n) => n.days === prefs?.notice_period_days)?.label} />
          <Info label="Willing to relocate" value={yesNo(prefs?.willing_to_relocate)} />
        </dl>
      </SetupCard>
      <SetupCard id="experience" title="Work experience" caption="Roles used to tailor your resumes" icon={Briefcase} step={2}>
        <Rows
          rows={experience.map((e) => ({
            key: e.id,
            title: `${e.job_title} · ${e.company_name}`,
            detail: join([
              e.employment_type ? EMPLOYMENT_TYPE_LABELS[e.employment_type] : null,
              `${monthLabel(e.start_date)} – ${e.is_current ? "Present" : monthLabel(e.end_date, "—")}`,
              [e.location_city, countryName(e.location_country)].filter(Boolean).join(", "),
            ]),
          }))}
        />
      </SetupCard>
      <SetupCard id="skills" title="Skills & expertise" caption="Improves match accuracy" icon={Code} step={3}>
        <dl className="info-grid one">
          <Info label="Technical skills" value={skillsOf("technical")} />
          <Info label="Soft skills" value={skillsOf("soft")} />
          <Info label="Tools & technologies" value={skillsOf("tool")} />
        </dl>
      </SetupCard>
      <SetupCard id="education" title="Education & certifications" caption="Qualifications recruiters look for" icon={GraduationCap} step={5}>
        <Rows
          rows={[
            ...education.map((e) => ({
              key: e.id,
              title: e.degree_name,
              detail: join([EDUCATION_LEVEL_LABELS[e.education_level], e.institution_name, formatYears(e.start_year, e.end_year, e.is_currently_studying)]),
            })),
            ...certifications.map((c) => ({
              key: c.id,
              title: c.certification_name,
              detail: join([c.issuing_organization, c.issue_date ? `Issued ${monthLabel(c.issue_date)}` : null, c.credential_id ? `ID ${c.credential_id}` : null]),
            })),
          ]}
        />
      </SetupCard>
      <SetupCard id="additional" title="Additional information" caption="Eligibility, languages and notifications" icon={Award} step={5}>
        <dl className="info-grid">
          <Info label="Languages" value={languages.map((l) => `${l.language_name} (${PROFICIENCY_LABELS[l.proficiency_level]})`).join(", ")} />
          <Info label="Career gap" value={profile.career_gap ? CAREER_GAP_LABELS[profile.career_gap] : null} />
          <Info
            label="Work authorization"
            value={
              profile.work_authorization_status
                ? join([WORK_AUTH_LABELS[profile.work_authorization_status], countryName(profile.work_authorization_country)])
                : null
            }
          />
          <Info label="Needs visa sponsorship" value={yesNo(prefs?.requires_visa_sponsorship)} />
          <Info label="Visible to recruiters" value={prefs ? yesNo(prefs.recruiter_visibility) : null} />
          <Info label="Daily job-match digest" value={prefs ? yesNo(prefs.daily_job_match_digest) : null} />
        </dl>
      </SetupCard>
    </>
  );
}
