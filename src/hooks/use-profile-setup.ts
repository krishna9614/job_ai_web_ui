"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileSetupService } from "@/services/profile-setup.service";
import type { ListInput, OnboardingUpdate, PreferencesUpdate, SetupLists, SkillCategory } from "@/types/api";
import { queryKeys } from "./query-keys";

export function usePreferences() {
  return useQuery({ queryKey: queryKeys.preferences, queryFn: profileSetupService.getPreferences, staleTime: 30_000 });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: PreferencesUpdate) => profileSetupService.updatePreferences(body),
    onSuccess: (prefs) => queryClient.setQueryData(queryKeys.preferences, prefs),
  });
}

export function useSkills() {
  return useQuery({ queryKey: queryKeys.skills, queryFn: profileSetupService.getSkills, staleTime: 30_000 });
}

export function useReplaceSkills() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: { name: string; category: SkillCategory }[]) => profileSetupService.replaceSkills(items),
    onSuccess: (skills) => queryClient.setQueryData(queryKeys.skills, skills),
  });
}

export function useSetupList<K extends keyof SetupLists>(section: K) {
  return useQuery({
    queryKey: queryKeys.list(section),
    queryFn: () => profileSetupService.getList(section),
    staleTime: 30_000,
  });
}

export function useReplaceList<K extends keyof SetupLists>(section: K) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (items: ListInput<SetupLists[K]>[]) => profileSetupService.replaceList(section, items),
    onSuccess: (rows) => queryClient.setQueryData(queryKeys.list(section), rows),
  });
}

/** Records the step to resume from ("Save & exit") and marks setup complete on Finish. */
export function useUpdateOnboarding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: OnboardingUpdate) => profileSetupService.updateOnboarding(body),
    onSuccess: (user) => queryClient.setQueryData(queryKeys.currentUser, user),
  });
}
