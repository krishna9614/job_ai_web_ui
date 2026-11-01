import type { Metadata } from "next";
import { CircleHelp } from "lucide-react";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthShell } from "@/components/layout/auth-shell";

export const metadata: Metadata = { title: "Reset password" };

export default function Page() {
  return (
    <AuthShell variant="right" topRight={<><CircleHelp className="ic ic-sm" />Need help? <Link href="mailto:support@jobai.com">Contact support</Link></>}>
      <ResetPasswordForm />
    </AuthShell>
  );
}
