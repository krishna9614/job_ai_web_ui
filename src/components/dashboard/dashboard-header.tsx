"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/use-auth";
import { displayName, initials } from "@/lib/profile/format";
import type { Profile, User } from "@/types/api";

export function DashboardHeader({ user, profile }: { user?: User; profile?: Profile | null }) {
  const router = useRouter();
  const logout = useLogout();

  return (
    <header className="dash-top">
      <nav className="nav" aria-label="Main">
        <Logo href="/dashboard" />
        <div className="nav-links">
          <Link className="active" href="/dashboard" aria-current="page">
            My Profile
          </Link>
          <Link href="/onboarding/basic">Profile Setup</Link>
        </div>
        <div className="nav-cta">
          {user ? (
            <div className="dash-user">
              <span className="avatar-sm" aria-hidden>
                {initials(profile, user)}
              </span>
              <span className="who">
                <b>{displayName(profile, user)}</b>
                <small>{user.email}</small>
              </span>
            </div>
          ) : null}
          <Button
            variant="ghost"
            size="xs"
            loading={logout.isPending}
            onClick={() => logout.mutate(undefined, { onSettled: () => router.replace("/login") })}
          >
            <LogOut className="ic ic-sm" />
            Log out
          </Button>
        </div>
      </nav>
    </header>
  );
}
