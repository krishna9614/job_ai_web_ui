import type {
  CareerGap,
  EducationLevelCode,
  EmploymentStatus,
  EmploymentType,
  LanguageProficiency,
  WorkAuthorizationStatus,
  WorkType,
} from "@/types/api";

/** Display labels for the backend's enum codes, in the order the onboarding screens show them. */
export const EMPLOYMENT_STATUS_LABELS: Record<EmploymentStatus, string> = {
  student: "Student",
  fresher: "Fresher",
  employed: "Employed",
  actively_looking: "Actively looking",
};

export const WORK_TYPE_LABELS: Record<WorkType, string> = { remote: "Remote", hybrid: "Hybrid", on_site: "On-site" };

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  internship: "Internship",
  freelance: "Freelance",
};

export const CAREER_GAP_LABELS: Record<CareerGap, string> = {
  none: "None",
  under_6_months: "Less than 6 months",
  "6_to_12_months": "6–12 months",
  over_1_year: "More than a year",
};

export const WORK_AUTH_LABELS: Record<WorkAuthorizationStatus, string> = {
  citizen: "Citizen",
  permanent_resident: "Permanent resident",
  work_visa: "Work visa",
  student_visa: "Student visa",
  other: "Other",
};

export const EDUCATION_LEVEL_LABELS: Record<EducationLevelCode, string> = {
  high_school: "High School",
  diploma: "Diploma",
  associate: "Associate Degree",
  bachelors: "Bachelor's Degree",
  masters: "Master's Degree",
  mba: "MBA",
  doctorate: "Doctorate / PhD",
  professional: "Professional Degree",
  certificate: "Certificate",
  other: "Other",
};

export const PROFICIENCY_LABELS: Record<LanguageProficiency, string> = {
  basic: "Basic",
  conversational: "Conversational",
  intermediate: "Intermediate",
  professional: "Professional",
  native: "Native",
};

/** "Total experience" ranges; the profile stores the range's lower bound in years. */
export const EXPERIENCE_RANGES = [
  { label: "Less than 1 year", years: 0 },
  { label: "1–2 years", years: 1 },
  { label: "3–5 years", years: 3 },
  { label: "6–8 years", years: 6 },
  { label: "9–12 years", years: 9 },
  { label: "13+ years", years: 13 },
] as const;

export function experienceLabel(years: number | null | undefined): string {
  if (years === null || years === undefined) return "";
  return [...EXPERIENCE_RANGES].reverse().find((r) => years >= r.years)?.label ?? "";
}

export const NOTICE_PERIODS = [
  { label: "Immediately", days: 0 },
  { label: "15 days", days: 15 },
  { label: "30 days", days: 30 },
  { label: "60 days", days: 60 },
  { label: "90 days", days: 90 },
] as const;

export const CURRENCIES = ["INR", "USD", "EUR", "GBP", "CAD", "AUD", "SGD", "AED"] as const;

/** Inverse lookup for the label maps above. */
export function codeFor<K extends string>(labels: Record<K, string>, label: string): K | null {
  return (Object.keys(labels) as K[]).find((k) => labels[k] === label) ?? null;
}

export function formatSalary(amount: number, currency: string | null): string {
  return amount.toLocaleString(currency === "INR" ? "en-IN" : "en-US");
}

/** Parses "1500000" or "12,00,000 – 18,00,000" into a min/max pair; null when it isn't a number or range. */
export function parseSalaryRange(input: string): { min: number | null; max: number | null } | null {
  const text = input.trim();
  if (!text) return { min: null, max: null };
  const parts = text.split(/\s*(?:–|—|-|to)\s*/i).filter(Boolean);
  if (parts.length > 2) return null;
  const nums = parts.map((p) => Number(p.replace(/[,\s]/g, "")));
  if (nums.some((n) => !Number.isFinite(n) || n < 0)) return null;
  return { min: nums[0], max: nums[1] ?? null };
}

/** "2015 – 2019" / "2024 – Present" → years plus the "currently studying" flag. */
export function parseYears(input: string): { start: number | null; end: number | null; current: boolean } | null {
  const text = input.trim();
  if (!text) return { start: null, end: null, current: false };
  const years = text.match(/\d{4}/g)?.map(Number) ?? [];
  const current = /present|now|current/i.test(text);
  if (!years.length || years.length > 2 || (current && years.length > 1)) return null;
  return { start: years[0], end: current ? null : (years[1] ?? null), current };
}

export function formatYears(start: number | null, end: number | null, current: boolean): string {
  if (!start && !end) return "";
  return [start, current ? "Present" : end].filter(Boolean).join(" – ");
}

export function monthLabel(value: string | null | undefined, empty = "Present"): string {
  if (!value) return empty;
  const [y, m] = value.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/** <input type="month"> value ⇄ the API's YYYY-MM-DD dates. */
export const toMonth = (date: string | null | undefined) => (date ? date.slice(0, 7) : "");
export const fromMonth = (month: string) => (month ? `${month}-01` : null);
