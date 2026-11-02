import { apiClient } from "@/lib/api/client";
import type { Credentials, LoginResult, MessageResult, SignupInput, SignupResult, User } from "@/types/api";

export const authService = {
  async login(credentials: Credentials & { remember: boolean }): Promise<LoginResult> {
    const { data } = await apiClient.post<LoginResult>("/auth/login", credentials);
    return data;
  },

  async signup(input: SignupInput): Promise<SignupResult> {
    const { data } = await apiClient.post<SignupResult>("/auth/signup", input);
    return data;
  },

  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },

  /** POST /api/v1/auth/password/forgot (same response whether or not the email is registered). */
  async forgotPassword(email: string): Promise<MessageResult> {
    const { data } = await apiClient.post<MessageResult>("/auth/forgot-password", { email });
    return data;
  },

  /** POST /api/v1/auth/verification/resend */
  async resendVerification(email: string): Promise<MessageResult> {
    const { data } = await apiClient.post<MessageResult>("/auth/resend-verification", { email });
    return data;
  },

  /** Exchanges the reset link's token_hash for a recovery session (HttpOnly cookie). */
  async startRecovery(tokenHash: string): Promise<void> {
    await apiClient.post("/auth/recovery", { token_hash: tokenHash });
  },

  async recoveryStatus(): Promise<boolean> {
    const { data } = await apiClient.get<{ active: boolean }>("/auth/recovery");
    return data.active;
  },

  /** POST /api/v1/auth/password/reset with the recovery session. */
  async resetPassword(password: string): Promise<MessageResult> {
    const { data } = await apiClient.post<MessageResult>("/auth/reset-password", { password });
    return data;
  },

  /** POST /api/v1/users/me/email-change: emails a confirmation link to the new address. */
  async requestEmailChange(email: string): Promise<MessageResult> {
    const { data } = await apiClient.post<MessageResult>("/backend/users/me/email-change", { email });
    return data;
  },

  /** GET /api/v1/users/me */
  async getCurrentUser(): Promise<User> {
    const { data } = await apiClient.get<User>("/backend/users/me");
    return data;
  },
};
