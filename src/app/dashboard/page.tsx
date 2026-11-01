import type { Metadata } from "next";
import { ProfileDashboard } from "@/components/dashboard/profile-dashboard";

export const metadata: Metadata = { title: "My profile" };

export default function DashboardPage() {
  return <ProfileDashboard />;
}
