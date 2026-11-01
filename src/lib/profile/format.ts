import type { Profile, User } from "@/types/api";
import { countryName } from "./countries";

export function displayName(profile: Profile | null | undefined, user?: User | null): string {
  if (profile) {
    return [profile.preferred_name || profile.first_name, profile.last_name].filter(Boolean).join(" ");
  }
  return user?.email.split("@")[0] ?? "";
}

export function legalName(profile: Profile): string {
  return [profile.first_name, profile.middle_name, profile.last_name].filter(Boolean).join(" ");
}

export function initials(profile: Profile | null | undefined, user?: User | null): string {
  const source = profile
    ? [profile.preferred_name || profile.first_name, profile.last_name].filter(Boolean).join(" ")
    : (user?.email ?? "");
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : (parts[0]?.slice(0, 2) ?? "?")).toUpperCase();
}

export function formatLocation(profile: Pick<Profile, "city" | "state_province" | "country_code">): string | null {
  const parts = [profile.city, profile.state_province, countryName(profile.country_code)].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

export function formatPhone(profile: Pick<Profile, "phone_country_code" | "phone_number">): string | null {
  if (!profile.phone_number) return null;
  return [profile.phone_country_code, profile.phone_number].filter(Boolean).join(" ");
}

export function formatDate(iso: string | null | undefined, withTime = false): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  }).format(date);
}

export function prettyUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  return `${local[0] ?? ""}***@${domain}`;
}

export function humanise(value: string): string {
  return value.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}
