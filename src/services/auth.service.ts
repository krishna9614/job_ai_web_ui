import { apiClient } from "@/lib/api/client";
import type { Credentials, LoginResult, SignupResult, User } from "@/types/api";

export const authService = {
  async login(credentials: Credentials & { remember: boolean }): Promise<LoginResult> {
    const { data } = await apiClient.post<LoginResult>("/auth/login", credentials);
    return data;
  },

  async signup(credentials: Credentials): Promise<SignupResult> {
    const { data } = await apiClient.post<SignupResult>("/auth/signup", credentials);
    return data;
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },

  /** GET /api/v1/users/me */
  async getCurrentUser(): Promise<User> {
    const { data } = await apiClient.get<User>("/backend/users/me");
    return data;
  },
};
