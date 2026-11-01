import type { Metadata } from "next";

import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { AuthShell } from "@/components/layout/auth-shell";

export const metadata: Metadata = { title: "Forgot password" };

export default function Page() {
  return (
    <AuthShell variant="right" topRight={<>Remembered it? <Link href="/login">Log in</Link></>}>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
