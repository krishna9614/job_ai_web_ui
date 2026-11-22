export const queryKeys = {
  currentUser: ["users", "me"] as const,
  profile: ["users", "me", "profile"] as const,
  preferences: ["users", "me", "preferences"] as const,
  skills: ["users", "me", "skills"] as const,
  list: (section: string) => ["users", "me", section] as const,
};
