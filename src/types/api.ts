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

export interface Profile {
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

export type ProfileFields = Omit<Profile, "user_id" | "created_at" | "updated_at">;

/** POST /users/me/profile: first_name is required, everything else optional. */
export type ProfileCreate = Pick<ProfileFields, "first_name"> &
  Partial<Omit<ProfileFields, "first_name">>;

/** PATCH /users/me/profile: only sent fields change; null clears an optional field. */
export type ProfileUpdate = Partial<ProfileFields>;

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
