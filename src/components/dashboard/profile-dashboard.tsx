"use client";

import { CircleCheck, Pencil, RefreshCw, Sparkles, UserPlus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Leaves } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { useCurrentUser } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { ApiError } from "@/lib/api/errors";
import { DashboardHeader } from "./dashboard-header";
import { DashboardSkeleton } from "./dashboard-skeleton";
import { ProfileForm } from "./profile-form";
import { AccountCard, ProfileSections, ProfileSummaryCard } from "./profile-view";
import { PROFILE_SECTIONS, type SectionId } from "./sections";

type Mode = { kind: "view" } | { kind: "edit"; section: SectionId | null } | { kind: "create" };

/**
 * User Profile Dashboard: GET /users/me + GET /users/me/profile, then view, create (POST)
 * or edit (PATCH) the profile. Layout reuses the design's cards, fields, rings and buttons.
 */
export function ProfileDashboard() {
  const user = useCurrentUser();
  const profile = useProfile();
  const [mode, setMode] = useState<Mode>({ kind: "view" });
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(null), 6000);
    return () => clearTimeout(t);
  }, [success]);

  const loading = user.isPending || profile.isPending;
  const loadError = (user.error ?? profile.error) as ApiError | null;
  const hasProfile = Boolean(profile.data);

  const onSaved = (message: string) => {
    setSuccess(message);
    setMode({ kind: "view" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const heading =
    mode.kind === "create" ? "Create your" : mode.kind === "edit" ? "Edit your" : hasProfile || loading ? "My" : "Welcome to";
  const subtitle =
    mode.kind === "create"
      ? "Tell us about yourself. You can change any of this later."
      : mode.kind === "edit"
        ? "Update your details and save when you're ready."
        : "View and manage the information JobAI uses to match and apply for you.";

  return (
    <main className="dash">
      <Leaves variant="onboarding" />
      <DashboardHeader user={user.data} profile={profile.data} />
      <div className="dash-main">
        <div className="container">
          <div className="dash-head">
            <div>
              <h1>
                {heading} <span className="hl">{mode.kind === "view" && !hasProfile && !loading ? "JobAI" : "profile"}</span>
              </h1>
              <p>{subtitle}</p>
            </div>
            {mode.kind === "view" && hasProfile ? (
              <div className="actions">
                <Button variant="ghost" size="sm" onClick={() => setMode({ kind: "edit", section: null })}>
                  <Pencil className="ic ic-sm" />
                  Edit profile
                </Button>
              </div>
            ) : null}
          </div>

          {success ? (
            <Notice tone="ok" onDismiss={() => setSuccess(null)}>
              {success}
            </Notice>
          ) : null}

          {loading ? (
            <DashboardSkeleton />
          ) : loadError ? (
            <div className="card empty-card" role="alert">
              <h2>
                We couldn’t load <span className="hl">your profile</span>
              </h2>
              <p className="sub">{loadError.message}</p>
              <Button
                arrow={<RefreshCw className="ic ic-sm" />}
                loading={user.isFetching || profile.isFetching}
                onClick={() => {
                  void user.refetch();
                  void profile.refetch();
                }}
              >
                Try again
              </Button>
            </div>
          ) : user.data ? (
            <div className="dash-grid">
              <aside className="dash-side">
                <ProfileSummaryCard profile={profile.data ?? null} user={user.data} />
                <AccountCard user={user.data} />
              </aside>
              {mode.kind === "edit" && profile.data ? (
                <ProfileForm
                  key="edit"
                  profile={profile.data}
                  focusSection={mode.section}
                  onCancel={() => setMode({ kind: "view" })}
                  onSaved={onSaved}
                />
              ) : mode.kind === "create" || (mode.kind === "edit" && !profile.data) ? (
                <ProfileForm key="create" profile={null} onCancel={() => setMode({ kind: "view" })} onSaved={onSaved} />
              ) : profile.data ? (
                <ProfileSections profile={profile.data} onEdit={(section) => setMode({ kind: "edit", section })} />
              ) : (
                <div className="card empty-card">
                  <div className="icon-tile" style={{ margin: "0 auto 18px" }}>
                    <UserPlus className="ic ic-lg" />
                  </div>
                  <h2>
                    You haven’t created <span className="hl">your profile</span> yet
                  </h2>
                  <p className="sub">
                    Add your details once and JobAI will use them to find roles, tailor resumes and fill in applications for you.
                  </p>
                  <div className="done-ctas">
                    <Button arrow onClick={() => setMode({ kind: "create" })}>
                      Create profile
                    </Button>
                    <Link className="btn btn-outline" href="/onboarding/basic">
                      <Sparkles className="ic ic-sm" />
                      Guided setup
                    </Link>
                  </div>
                  <div className="done-list">
                    {PROFILE_SECTIONS.map((s) => (
                      <span key={s.id}>
                        <CircleCheck className="ic ic-sm" />
                        {s.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
