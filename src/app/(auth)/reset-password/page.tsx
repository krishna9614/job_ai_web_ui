import type { Metadata } from "next";
import { Suspense } from "react";
import { CircleHelp } from "lucide-react";
import { SUPPORT_HREF } from "@/lib/config";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthShell } from "@/components/layout/auth-shell";

export const metadata: Metadata = { title: "Reset password" };

export default function Page() {
  return (
    <AuthShell variant="right" topRight={<><CircleHelp className="ic ic-sm" />Need help? <a href={SUPPORT_HREF}>Contact support</a></>}>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
