import type { Metadata } from "next";
import { Suspense } from "react";
import { ProfileDashboard } from "@/components/dashboard/profile-dashboard";

export const metadata: Metadata = { title: "My profile" };

export default function DashboardPage() {
  return (
    <Suspense>
      <ProfileDashboard />
    </Suspense>
  );
}
