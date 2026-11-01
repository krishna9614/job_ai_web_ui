import { CalendarDays, CircleCheck, ExternalLink, Mail, MapPin, Pencil, ShieldCheck, Sparkles } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { GithubIcon, LinkedinIcon } from "@/components/icons/brand";
import { countryName } from "@/lib/profile/countries";
import {
  displayName,
  formatDate,
  formatLocation,
  formatPhone,
  humanise,
  initials,
  legalName,
  prettyUrl,
} from "@/lib/profile/format";
import { profileCompleteness } from "@/lib/profile/schema";
import type { Profile, User } from "@/types/api";
import { PROFILE_SECTIONS, type SectionId } from "./sections";

function strengthCaption(p: number) {
  if (p < 40) return "Add more details to stand out";
  if (p < 100) return "Looking good — almost there";
  return "Your profile is complete";
}

export function ProfileSummaryCard({ profile, user }: { profile: Profile | null; user: User }) {
  const strength = profileCompleteness(profile);
  const location = profile ? formatLocation(profile) : null;
  return (
    <div className="card p-card">
      <div className="avatar-lg" aria-hidden>
        {initials(profile, user)}
      </div>
      <h2>{displayName(profile, user)}</h2>
      <p className="headline">{profile?.professional_headline ?? "Add a professional headline"}</p>
      {location ? (
        <span className="loc">
          <MapPin className="ic ic-xs" />
          {location}
        </span>
      ) : null}
      <div className="ob-strength">
        <div className="ring ring-sm" style={{ "--p": `${strength}%` } as CSSProperties}>
          <span>{strength}%</span>
        </div>
        <div>
          <b>Profile strength</b>
          <small>{strengthCaption(strength)}</small>
        </div>
      </div>
      {profile?.linkedin_url || profile?.github_url ? (
        <div className="links">
          {profile.linkedin_url ? (
            <a href={profile.linkedin_url} target="_blank" rel="noreferrer" aria-label="LinkedIn profile">
              <LinkedinIcon className="ic ic-sm" />
            </a>
          ) : null}
          {profile.github_url ? (
            <a href={profile.github_url} target="_blank" rel="noreferrer" aria-label="GitHub profile">
              <GithubIcon className="ic ic-sm" />
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function AccountCard({ user }: { user: User }) {
  const rows: { icon: typeof Mail; label: string; value: ReactNode }[] = [
    { icon: Mail, label: "Email", value: user.email },
    {
      icon: ShieldCheck,
      label: "Email status",
      value: user.email_verified_at ? (
        <span className="verified" style={{ fontSize: 13 }}>
          <CircleCheck className="ic ic-xs" />
          Verified
        </span>
      ) : (
        "Not verified"
      ),
    },
    { icon: Sparkles, label: "Account", value: humanise(user.account_status) },
    { icon: CalendarDays, label: "Member since", value: formatDate(user.created_at) ?? "—" },
  ];
  return (
    <div className="card acct-card">
      <h3>Account</h3>
      {rows.map(({ icon: Icon, label, value }) => (
        <div className="acct-row" key={label}>
          <span>
            <Icon className="ic ic-xs" />
            {label}
          </span>
          <b>{value}</b>
        </div>
      ))}
      <p style={{ fontSize: 12, color: "var(--faint)", marginTop: 10 }}>
        Last updated {formatDate(user.updated_at, true) ?? "—"}
      </p>
    </div>
  );
}

function Info({ label, value, full }: { label: string; value: ReactNode; full?: boolean }) {
  const empty = value === null || value === undefined || value === "";
  return (
    <div className="info" style={full ? { gridColumn: "1 / -1" } : undefined}>
      <dt>{label}</dt>
      <dd className={empty ? "empty" : undefined}>{empty ? "Not added yet" : value}</dd>
    </div>
  );
}

function externalLink(url: string | null): ReactNode {
  if (!url) return null;
  return (
    <a href={url} target="_blank" rel="noreferrer">
      {prettyUrl(url)}
      <ExternalLink className="ic ic-xs" />
    </a>
  );
}

export function SectionCard({
  id,
  onEdit,
  children,
  action,
}: {
  id: SectionId;
  onEdit?: (id: SectionId) => void;
  children: ReactNode;
  action?: ReactNode;
}) {
  const section = PROFILE_SECTIONS.find((s) => s.id === id)!;
  const Icon = section.icon;
  return (
    <section className="card sec-card" id={`section-${id}`} aria-labelledby={`section-${id}-title`}>
      <div className="sec-head">
        <h3 id={`section-${id}-title`}>
          <span className="oc-ic">
            <Icon className="ic ic-sm" />
          </span>
          <span>
            {section.title}
            <small>{section.caption}</small>
          </span>
        </h3>
        {action ??
          (onEdit ? (
            <button type="button" className="btn btn-ghost btn-xs" onClick={() => onEdit(id)} aria-label={`Edit ${section.title}`}>
              <Pencil className="ic ic-sm" />
              Edit
            </button>
          ) : null)}
      </div>
      {children}
    </section>
  );
}

export function ProfileSections({ profile, onEdit }: { profile: Profile; onEdit: (id: SectionId) => void }) {
  return (
    <div className="dash-sections">
      <SectionCard id="personal" onEdit={onEdit}>
        <dl className="info-grid">
          <Info label="Full name" value={legalName(profile)} />
          <Info label="Preferred name" value={profile.preferred_name} />
          <Info label="First name" value={profile.first_name} />
          <Info label="Middle name" value={profile.middle_name} />
          <Info label="Last name" value={profile.last_name} />
        </dl>
      </SectionCard>
      <SectionCard id="contact" onEdit={onEdit}>
        <dl className="info-grid">
          <Info label="Phone number" value={formatPhone(profile)} />
          <Info label="City" value={profile.city} />
          <Info label="State / province" value={profile.state_province} />
          <Info label="Country" value={countryName(profile.country_code)} />
        </dl>
      </SectionCard>
      <SectionCard id="professional" onEdit={onEdit}>
        <dl className="info-grid one">
          <Info label="Professional headline" value={profile.professional_headline} />
          <Info label="Professional summary" value={profile.professional_summary} />
        </dl>
      </SectionCard>
      <SectionCard id="links" onEdit={onEdit}>
        <dl className="info-grid">
          <Info label="LinkedIn" value={externalLink(profile.linkedin_url)} />
          <Info label="GitHub" value={externalLink(profile.github_url)} />
        </dl>
      </SectionCard>
      <p style={{ fontSize: 12.5, color: "var(--faint)", textAlign: "right" }}>
        Profile created {formatDate(profile.created_at)} · Last updated {formatDate(profile.updated_at, true)}
      </p>
    </div>
  );
}
