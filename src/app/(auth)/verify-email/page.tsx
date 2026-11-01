import type { Metadata } from "next";
import { CircleHelp } from "lucide-react";
import Link from "next/link";
import { VerifyEmailCard } from "@/components/auth/verify-email-card";
import { AuthShell } from "@/components/layout/auth-shell";

export const metadata: Metadata = { title: "Verify your email" };

export default function Page() {
  return (
    <AuthShell variant="right" topRight={<><CircleHelp className="ic ic-sm" />Need help? <Link href="mailto:support@jobai.com">Contact support</Link></>}>
      <VerifyEmailCard />
    </AuthShell>
  );
}
