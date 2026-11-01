import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import type { Profile, ProfileCreate, ProfileUpdate } from "@/types/api";

export const profileService = {
  /** GET /api/v1/users/me/profile. Resolves to null when the user has not created one (404). */
  async getProfile(): Promise<Profile | null> {
    try {
      const { data } = await apiClient.get<Profile>("/backend/users/me/profile");
      return data;
    } catch (error) {
      if (error instanceof ApiError && error.isNotFound) return null;
      throw error;
    }
  },

  /** POST /api/v1/users/me/profile */
  async createProfile(body: ProfileCreate): Promise<Profile> {
    const { data } = await apiClient.post<Profile>("/backend/users/me/profile", body);
    return data;
  },

  /** PATCH /api/v1/users/me/profile */
  async updateProfile(body: ProfileUpdate): Promise<Profile> {
    const { data } = await apiClient.patch<Profile>("/backend/users/me/profile", body);
    return data;
  },
};
