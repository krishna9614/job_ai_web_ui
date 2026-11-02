import type { Metadata } from "next";
import { Suspense } from "react";
import { CircleHelp } from "lucide-react";
import { SUPPORT_HREF } from "@/lib/config";
import { VerifyEmailCard } from "@/components/auth/verify-email-card";
import { AuthShell } from "@/components/layout/auth-shell";

export const metadata: Metadata = { title: "Verify your email" };

export default function Page() {
  return (
    <AuthShell variant="right" topRight={<><CircleHelp className="ic ic-sm" />Need help? <a href={SUPPORT_HREF}>Contact support</a></>}>
      <Suspense>
        <VerifyEmailCard />
      </Suspense>
    </AuthShell>
  );
}
