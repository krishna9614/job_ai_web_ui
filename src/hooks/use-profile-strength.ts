"use client";

import { useProfile } from "./use-profile";
import { usePreferences, useSetupList, useSkills } from "./use-profile-setup";

/**
 * Profile strength shared by the setup-complete screen and the dashboard: the share of
 * onboarding answers saved. Certifications are optional and don't count.
 */
export function useProfileStrength(): number {
  const profile = useProfile().data;
  const prefs = usePreferences().data;
  const skills = useSkills().data;
  const experience = useSetupList("experience").data;
  const education = useSetupList("education").data;
  const languages = useSetupList("languages").data;
  const noExperienceNeeded = prefs?.employment_status === "fresher" || prefs?.employment_status === "student";

  const checks = [
    profile?.first_name && profile.last_name,
    profile?.professional_headline,
    profile?.phone_number,
    profile?.city && profile.country_code,
    profile?.total_experience_years != null,
    prefs?.employment_status && prefs.preferred_job_titles.length,
    experience?.length || noExperienceNeeded,
    skills?.length,
    profile?.linkedin_url || profile?.github_url || profile?.portfolio_url,
    education?.length,
    languages?.length,
    profile?.work_authorization_status,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
