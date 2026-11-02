import { z } from "zod";

/** Mirrors app/schemas/auth.py in the backend (which stays authoritative). */
const email = z.string().trim().min(1, "Email is required").pipe(z.email("Enter a valid email address"));

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72;

/** Same rules as the backend's StrongPassword and Supabase's password_requirements. */
export const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (v: string) => v.length >= PASSWORD_MIN },
  { label: "One uppercase letter (A–Z)", test: (v: string) => /[A-Z]/.test(v) },
  { label: "One lowercase letter (a–z)", test: (v: string) => /[a-z]/.test(v) },
  { label: "One number (0–9)", test: (v: string) => /[0-9]/.test(v) },
  { label: "One special character (e.g. ! @ # $)", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const;

export const PASSWORD_REQUIREMENTS_TEXT =
  "8+ characters with an uppercase letter, a lowercase letter, a number and a special character";

export const strongPassword = z
  .string()
  .min(1, "Password is required")
  .max(PASSWORD_MAX, `Password must be at most ${PASSWORD_MAX} characters`)
  .superRefine((value, ctx) => {
    const missing = PASSWORD_RULES.filter((rule) => !rule.test(value));
    if (missing.length) {
      ctx.addIssue({
        code: "custom",
        message: `Password needs: ${missing.map((r) => r.label.replace(/^One /, "one ").replace(/^At least/, "at least")).join(", ")}`,
      });
    }
  });

const fullName = z
  .string()
  .trim()
  .min(1, "Full name is required")
  .max(200, "Full name must be at most 200 characters")
  .refine((v) => /\p{L}/u.test(v), "Full name must contain letters")
  .refine((v) => v.split(/\s+/).every((part) => part.length <= 100), "Each part of the name must be at most 100 characters");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required").max(PASSWORD_MAX, `Password must be at most ${PASSWORD_MAX} characters`),
  remember: z.boolean(),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  fullName,
  email,
  password: strongPassword,
  terms: z.boolean().refine((v) => v, "Please accept the Terms of Service and Privacy Policy"),
});
export type SignupValues = z.infer<typeof signupSchema>;

export const forgotSchema = z.object({ email });
export type ForgotValues = z.infer<typeof forgotSchema>;

export const emailChangeSchema = z.object({ email });
export type EmailChangeValues = z.infer<typeof emailChangeSchema>;

export const resetSchema = z
  .object({
    password: strongPassword,
    confirm: z.string().min(1, "Please confirm your new password"),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don't match" });
export type ResetValues = z.infer<typeof resetSchema>;

/** Four-bar meter: every rule met is "Good"; 12+ characters on top of that is "Strong". */
export function passwordStrength(value: string): { score: number; label: string } {
  const passed = PASSWORD_RULES.filter((r) => r.test(value)).length;
  if (passed === PASSWORD_RULES.length) return value.length >= 12 ? { score: 4, label: "Strong" } : { score: 3, label: "Good" };
  if (passed >= 3) return { score: 2, label: "Fair" };
  if (passed >= 1) return { score: 1, label: "Weak" };
  return { score: 0, label: "Too weak" };
}
