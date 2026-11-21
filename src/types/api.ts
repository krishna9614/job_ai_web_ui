/** Contracts mirrored from the JobAI FastAPI backend (app/schemas/*.py). */

export type AccountStatus = "active" | "suspended" | "deleted" | (string & {});
export type OnboardingStatus = "not_started" | "in_progress" | "completed" | (string & {});

export interface User {
  id: string;
  email: string;
  account_status: AccountStatus;
  onboarding_status: OnboardingStatus;
  onboarding_step: number;
  email_verified_at: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Credentials {
  email: string;
  password: string;
}

/** POST /auth/signup: the full name seeds the profile's first/middle/last name. */
export interface SignupInput extends Credentials {
  full_name: string;
}

/** Generic `{"detail": "..."}` acknowledgement (forgot password, resend, email change). */
export interface MessageResult {
  detail: string;
}

export interface Profile extends ProfileSetupFields {
  user_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string | null;
  preferred_name: string | null;
  phone_country_code: string | null;
  phone_number: string | null;
  city: string | null;
  state_province: string | null;
  country_code: string | null;
  professional_headline: string | null;
  professional_summary: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  created_at: string;
  updated_at: string;
}

/** Profile columns filled in by the onboarding steps (not part of the dashboard's edit form). */
export interface ProfileSetupFields {
  portfolio_url: string | null;
  /** Lower bound of the "Total experience" range picked in Basic Info. */
  total_experience_years: number | null;
  career_gap: CareerGap | null;
  work_authorization_status: WorkAuthorizationStatus | null;
  work_authorization_country: string | null;
}

export type CareerGap = "none" | "under_6_months" | "6_to_12_months" | "over_1_year";
export type WorkAuthorizationStatus = "citizen" | "permanent_resident" | "work_visa" | "student_visa" | "other";

export type ProfileFields = Omit<Profile, "user_id" | "created_at" | "updated_at" | keyof ProfileSetupFields>;

/** POST /users/me/profile: first_name is required, everything else optional. */
export type ProfileCreate = Pick<ProfileFields, "first_name"> &
  Partial<Omit<ProfileFields, "first_name"> & ProfileSetupFields>;

/** PATCH /users/me/profile: only sent fields change; null clears an optional field. */
export type ProfileUpdate = Partial<ProfileFields & ProfileSetupFields>;

export type EmploymentStatus = "student" | "fresher" | "employed" | "actively_looking";
export type WorkType = "remote" | "hybrid" | "on_site";
export type EmploymentType = "full_time" | "part_time" | "contract" | "internship" | "freelance";

/** GET/PATCH /users/me/preferences (PATCH creates the record on first save). */
export interface Preferences {
  employment_status: EmploymentStatus | null;
  preferred_job_titles: string[];
  preferred_locations: string[];
  preferred_work_types: WorkType[];
  preferred_employment_types: EmploymentType[];
  minimum_salary: number | null;
  maximum_salary: number | null;
  salary_currency: string | null;
  salary_period: "hourly" | "monthly" | "yearly" | null;
  notice_period_days: number | null;
  willing_to_relocate: boolean | null;
  requires_visa_sponsorship: boolean | null;
  recruiter_visibility: boolean;
  daily_job_match_digest: boolean;
  /** null until the first save. */
  updated_at: string | null;
}

export type PreferencesUpdate = Partial<Omit<Preferences, "updated_at">>;

export interface Experience {
  id: string;
  company_name: string;
  job_title: string;
  employment_type: EmploymentType | null;
  work_arrangement: WorkType | null;
  location_city: string | null;
  location_state: string | null;
  location_country: string | null;
  /** YYYY-MM-DD */
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
}

export type SkillCategory = "technical" | "soft" | "tool";

export interface Skill {
  name: string;
  category: SkillCategory | null;
}

export type EducationLevelCode =
  | "high_school"
  | "diploma"
  | "associate"
  | "bachelors"
  | "masters"
  | "mba"
  | "doctorate"
  | "professional"
  | "certificate"
  | "other";

export interface Education {
  id: string;
  education_level: EducationLevelCode;
  degree_name: string;
  institution_name: string;
  start_year: number | null;
  end_year: number | null;
  is_currently_studying: boolean;
}

export interface Certification {
  id: string;
  certification_name: string;
  issuing_organization: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
}

export type LanguageProficiency = "basic" | "conversational" | "intermediate" | "professional" | "native";

export interface Language {
  id: string;
  language_name: string;
  proficiency_level: LanguageProficiency;
}

/**
 * PUT /users/me/<section> bodies: the whole list. Items keep their id when edited; new items
 * have none; saved items left out are deleted.
 */
export type ListInput<T extends { id: string }> = Omit<T, "id"> & { id?: string };

export interface SetupLists {
  experience: Experience;
  education: Education;
  certifications: Certification;
  languages: Language;
}

export interface OnboardingUpdate {
  onboarding_step: number;
  onboarding_status?: "in_progress" | "completed";
}

/** Response of the frontend's /api/auth/login route (token stays in an HttpOnly cookie). */
export interface LoginResult {
  user: User;
}

/** Response of the frontend's /api/auth/signup route. */
export interface SignupResult {
  user: User;
  email_confirmation_required: boolean;
}

/** Error body returned by the backend: {"detail": "...", "code": "..."} or FastAPI 422 details. */
export interface ApiErrorBody {
  detail?: string | ValidationIssue[];
  code?: string;
}

export interface ValidationIssue {
  loc: (string | number)[];
  msg: string;
  type: string;
}
