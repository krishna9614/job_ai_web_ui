import { z } from "zod";

/** Mirrors app/schemas/auth.py: EmailStr, password 8–72 chars on signup, 1–72 on login. */
const email = z.string().trim().min(1, "Email is required").pipe(z.email("Enter a valid email address"));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required").max(72, "Password must be at most 72 characters"),
  remember: z.boolean(),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(200, "Name is too long"),
  email,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters")
    .regex(/\d/, "Include at least one number")
    .regex(/[^A-Za-z0-9]/, "Include at least one symbol"),
  terms: z.boolean().refine((v) => v, "Please accept the Terms of Service and Privacy Policy"),
});
export type SignupValues = z.infer<typeof signupSchema>;

export const forgotSchema = z.object({ email });
export type ForgotValues = z.infer<typeof forgotSchema>;

export const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "One number", test: (v: string) => /\d/.test(v) },
  { label: "One symbol", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const;

export const resetSchema = z
  .object({
    password: z
      .string()
      .max(72, "Password must be at most 72 characters")
      .refine((v) => PASSWORD_RULES.every((r) => r.test(v)), "Password doesn't meet the requirements"),
    confirm: z.string().min(1, "Please confirm your new password"),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don't match" });
export type ResetValues = z.infer<typeof resetSchema>;

export function passwordStrength(value: string): { score: number; label: string } {
  const score = PASSWORD_RULES.filter((r) => r.test(value)).length;
  const label = ["Too weak", "Weak", "Fair", "Good", "Strong"][score] ?? "Too weak";
  return { score: score === 4 && value.length < 10 ? 3 : score, label: score === 4 && value.length < 10 ? "Good" : label };
}
