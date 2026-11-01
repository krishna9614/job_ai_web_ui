"use client";

import { ArrowRight, Check, CircleCheck, CircleHelp, Heart } from "lucide-react";
import Link from "next/link";
import { useProfile } from "@/hooks/use-profile";
import { Leaves } from "@/components/layout/auth-shell";
import { OnboardingTop, StrengthRing } from "../onboarding-shell";

const CONFETTI = [
  [60, 40, "#15966D", 20],
  [130, 80, "#E2B33C", -30],
  [400, 36, "#086B50", 45],
  [462, 92, "#E2B33C", 10],
  [36, 300, "#9FD3B8", -15],
  [490, 300, "#15966D", 60],
  [190, 30, "#9FD3B8", 30],
  [340, 64, "#15966D", -40],
  [30, 150, "#086B50", 75],
  [500, 170, "#9FD3B8", -60],
] as const;

const SECTIONS = [
  "Basic information",
  "Career preferences",
  "Work experience",
  "Skills & expertise",
  "Resume & portfolio",
  "Additional information",
];

const MATCHES = [
  { co: "G", cls: "co-g", title: "Senior UX Designer", where: "Google · Remote", sal: "$165k – $195k · Full-time", match: "98% match", amber: false },
  { co: "S", cls: "co-g", title: "Lead Product Designer", where: "Stripe · San Francisco", sal: "$170k – $200k · Hybrid", match: "95% match", amber: false },
  { co: "M", cls: "co-m", title: "Senior Product Designer", where: "Microsoft · Seattle", sal: "$150k – $182k · Hybrid", match: "93% match", amber: false },
  { co: "a", cls: "co-a", title: "UX Design Manager", where: "Amazon · Remote", sal: "$158k – $190k · Full-time", match: "89% match", amber: true },
];

/** Frame 13. */
export function CompleteStep() {
  const { data: profile } = useProfile();
  const name = profile?.preferred_name || profile?.first_name;

  return (
    <main className="auth ob">
      <Leaves variant="onboarding" />
      <OnboardingTop
        right={
          <>
            <CircleHelp className="ic ic-sm" />
            Need help? <Link href="mailto:support@jobai.com">Contact support</Link>
          </>
        }
      />
      <div className="ob-body ob-done">
        <div className="ob-card done-card">
          {CONFETTI.map(([left, top, background, rot], i) => (
            <i key={i} className="cf" style={{ left, top, background, transform: `rotate(${rot}deg)` }}></i>
          ))}
          <div className="big-check">
            <Check className="ic" />
          </div>
          <h2>
            Your profile is <span className="hl">complete!</span>
          </h2>
          <p className="sub">You&apos;re all set{name ? `, ${name}` : ""}. Thousands of jobs are waiting for you.</p>
          <StrengthRing value={100} size="lg" />
          <div className="done-list">
            {SECTIONS.map((s) => (
              <span key={s}>
                <CircleCheck className="ic ic-sm" />
                {s}
              </span>
            ))}
          </div>
          <div className="done-ctas">
            <Link className="btn btn-primary" href="/dashboard">
              Browse Jobs{" "}
              <span className="arrow">
                <ArrowRight className="ic ic-sm" />
              </span>
            </Link>
            <Link className="btn btn-outline" href="/dashboard">
              View Profile
            </Link>
          </div>
        </div>
        <div className="ob-card matches-card">
          <div className="mc-head">
            <div>
              <b>Top job matches for you</b>
              <small>Based on your new profile</small>
            </div>
            <Link href="/dashboard">
              See all <ArrowRight className="ic ic-xs" />
            </Link>
          </div>
          {MATCHES.map((m) => (
            <div className="job match" key={m.title}>
              <span className={`co ${m.cls}`}>{m.co}</span>
              <div>
                <b>{m.title}</b>
                <small>{m.where}</small>
                <small className="sal">{m.sal}</small>
              </div>
              <div className="match-r">
                <span className={`pill ${m.amber ? "pill-amber" : ""}`}>{m.match}</span>
                <Link className="btn btn-primary btn-xs" href="/dashboard">
                  Apply
                </Link>
              </div>
            </div>
          ))}
          <div className="mc-foot">
            <Heart className="ic ic-sm" />
            Happy job hunting! New matches arrive daily.
          </div>
        </div>
      </div>
    </main>
  );
}
