"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth-store";
import { useOnboardingStore } from "@/stores/onboarding-store";
import type { Credentials } from "@/types/api";
import { queryKeys } from "./query-keys";

/** GET /users/me, mirrored into the auth store so any component can read the session user. */
export function useCurrentUser(enabled = true) {
  const setUser = useAuthStore((s) => s.setUser);
  const query = useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: authService.getCurrentUser,
    enabled,
    staleTime: 60_000,
  });
  useEffect(() => {
    if (query.data) setUser(query.data);
  }, [query.data, setUser]);
  return query;
}

export function useLogin() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (input: Credentials & { remember: boolean }) => authService.login(input),
    onSuccess: ({ user }) => {
      queryClient.clear();
      queryClient.setQueryData(queryKeys.currentUser, user);
      setUser(user);
    },
  });
}

export function useSignup() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const setPendingVerificationEmail = useAuthStore((s) => s.setPendingVerificationEmail);
  return useMutation({
    mutationFn: (input: Credentials) => authService.signup(input),
    onSuccess: (result, input) => {
      queryClient.clear();
      if (result.email_confirmation_required) {
        setPendingVerificationEmail(input.email);
        return;
      }
      queryClient.setQueryData(queryKeys.currentUser, result.user);
      setUser(result.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const reset = useAuthStore((s) => s.reset);
  const resetOnboarding = useOnboardingStore((s) => s.reset);
  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      queryClient.clear();
      reset();
      resetOnboarding();
    },
  });
}
