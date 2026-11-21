import { apiClient } from "@/lib/api/client";
import type {
  ListInput,
  OnboardingUpdate,
  Preferences,
  PreferencesUpdate,
  SetupLists,
  Skill,
  SkillCategory,
  User,
} from "@/types/api";

export const profileSetupService = {
  /** GET /api/v1/users/me/preferences (empty defaults before the first save). */
  async getPreferences(): Promise<Preferences> {
    const { data } = await apiClient.get<Preferences>("/backend/users/me/preferences");
    return data;
  },

  /** PATCH /api/v1/users/me/preferences */
  async updatePreferences(body: PreferencesUpdate): Promise<Preferences> {
    const { data } = await apiClient.patch<Preferences>("/backend/users/me/preferences", body);
    return data;
  },

  /** GET /api/v1/users/me/skills */
  async getSkills(): Promise<Skill[]> {
    const { data } = await apiClient.get<Skill[]>("/backend/users/me/skills");
    return data;
  },

  /** PUT /api/v1/users/me/skills */
  async replaceSkills(items: { name: string; category: SkillCategory }[]): Promise<Skill[]> {
    const { data } = await apiClient.put<Skill[]>("/backend/users/me/skills", { items });
    return data;
  },

  /** GET /api/v1/users/me/{experience|education|certifications|languages} */
  async getList<K extends keyof SetupLists>(section: K): Promise<SetupLists[K][]> {
    const { data } = await apiClient.get<SetupLists[K][]>(`/backend/users/me/${section}`);
    return data;
  },

  /** PUT /api/v1/users/me/{section}: saves the whole list. */
  async replaceList<K extends keyof SetupLists>(section: K, items: ListInput<SetupLists[K]>[]): Promise<SetupLists[K][]> {
    const { data } = await apiClient.put<SetupLists[K][]>(`/backend/users/me/${section}`, { items });
    return data;
  },

  /** PATCH /api/v1/users/me/onboarding */
  async updateOnboarding(body: OnboardingUpdate): Promise<User> {
    const { data } = await apiClient.patch<User>("/backend/users/me/onboarding", body);
    return data;
  },
};
