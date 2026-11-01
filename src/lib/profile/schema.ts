import { z } from "zod";
import type { Profile, ProfileCreate, ProfileFields, ProfileUpdate } from "@/types/api";

/** Client-side mirror of app/schemas/profile.py constraints; the backend remains authoritative. */
const optional = (max: number, label: string) =>
  z.string().trim().max(max, `${label} must be at most ${max} characters`);

const url = (label: string) =>
  z
    .string()
    .trim()
    .max(2048, `${label} is too long`)
    .refine((v) => {
      if (!v) return true;
      try {
        const parsed = new URL(v);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    }, `Enter a full URL starting with https://`);

export const profileFormSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required").max(100, "First name must be at most 100 characters"),
  middle_name: optional(100, "Middle name"),
  last_name: optional(100, "Last name"),
  preferred_name: optional(100, "Preferred name"),
  phone_country_code: z
    .string()
    .trim()
    .refine((v) => !v || /^\+?[0-9]{1,7}$/.test(v), "Use digits only, e.g. +1"),
  phone_number: z
    .string()
    .trim()
    .refine((v) => !v || /^[0-9 ()\-.]{4,30}$/.test(v), "Use 4–30 digits, spaces, dashes or brackets"),
  city: optional(120, "City"),
  state_province: optional(120, "State / province"),
  country_code: z
    .string()
    .trim()
    .refine((v) => !v || /^[A-Za-z]{2}$/.test(v), "Choose a country"),
  professional_headline: optional(250, "Headline"),
  professional_summary: optional(5000, "Summary"),
  linkedin_url: url("LinkedIn URL"),
  github_url: url("GitHub URL"),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
type FieldKey = keyof ProfileFields;

export const PROFILE_FIELD_KEYS = Object.keys(profileFormSchema.shape) as FieldKey[];

export const EMPTY_PROFILE_FORM: ProfileFormValues = Object.fromEntries(
  PROFILE_FIELD_KEYS.map((k) => [k, ""]),
) as ProfileFormValues;

/** Profile from the API -> form values (null becomes ""). */
export function profileToForm(profile: Profile | null | undefined): ProfileFormValues {
  if (!profile) return { ...EMPTY_PROFILE_FORM };
  return Object.fromEntries(PROFILE_FIELD_KEYS.map((k) => [k, profile[k] ?? ""])) as ProfileFormValues;
}

function normalise(values: ProfileFormValues): ProfileFields {
  const out = Object.fromEntries(
    PROFILE_FIELD_KEYS.map((k) => {
      const v = values[k].trim();
      return [k, v === "" ? null : v];
    }),
  ) as Record<FieldKey, string | null>;
  if (out.country_code) out.country_code = out.country_code.toUpperCase();
  if (out.phone_country_code && !out.phone_country_code.startsWith("+")) {
    out.phone_country_code = `+${out.phone_country_code}`;
  }
  return out as ProfileFields;
}

/** Body for POST /users/me/profile: only filled-in fields are sent. */
export function toCreatePayload(values: ProfileFormValues): ProfileCreate {
  const fields = normalise(values);
  return Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== null)) as ProfileCreate;
}

/**
 * Body for PATCH /users/me/profile: only fields that changed versus the stored profile.
 * Cleared optional fields are sent as null, which the backend uses to clear them.
 */
export function toUpdatePayload(values: ProfileFormValues, current: Profile): ProfileUpdate {
  const fields = normalise(values);
  const patch: Record<string, string | null> = {};
  for (const key of PROFILE_FIELD_KEYS) {
    if (fields[key] !== (current[key] ?? null)) patch[key] = fields[key];
  }
  return patch as ProfileUpdate;
}

/** Share of profile fields filled in, used for the design's "profile strength" ring. */
export function profileCompleteness(profile: Profile | null | undefined): number {
  if (!profile) return 0;
  const weighted: FieldKey[] = [
    "first_name",
    "last_name",
    "professional_headline",
    "professional_summary",
    "phone_number",
    "city",
    "country_code",
    "linkedin_url",
    "github_url",
  ];
  const filled = weighted.filter((k) => Boolean(profile[k])).length;
  return Math.round((filled / weighted.length) * 100);
}
