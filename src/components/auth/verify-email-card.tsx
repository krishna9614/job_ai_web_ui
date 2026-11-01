"use client";

import { ExternalLink, Mail, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Notice } from "@/components/ui/notice";
import { maskEmail } from "@/lib/profile/format";
import { useAuthStore } from "@/stores/auth-store";

const INBOXES: Record<string, { label: string; url: string }> = {
  "gmail.com": { label: "Open Gmail", url: "https://mail.google.com/" },
  "googlemail.com": { label: "Open Gmail", url: "https://mail.google.com/" },
  "outlook.com": { label: "Open Outlook", url: "https://outlook.live.com/mail/" },
  "hotmail.com": { label: "Open Outlook", url: "https://outlook.live.com/mail/" },
  "yahoo.com": { label: "Open Yahoo Mail", url: "https://mail.yahoo.com/" },
  "icloud.com": { label: "Open iCloud Mail", url: "https://www.icloud.com/mail" },
};

export function VerifyEmailCard() {
  const email = useAuthStore((s) => s.pendingVerificationEmail);
  const [info, setInfo] = useState<string | null>(null);
  const inbox = email ? INBOXES[email.split("@")[1]?.toLowerCase() ?? ""] : undefined;

  return (
    <div className="auth-card center">
      <div className="illus">
        <span className="halo"></span>
        <span className="halo2"></span>
        <svg className="main" width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden>
          <rect x="6" y="16" width="60" height="42" rx="8" fill="#FFFFFF" stroke="#086B50" strokeWidth="3" />
          <path d="M8 20 L33 38 a5 5 0 0 0 6 0 L64 20" stroke="#086B50" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="58" cy="18" r="10" fill="#15966D" stroke="#FFFFFF" strokeWidth="3" />
          <path d="M53.5 18 l3 3 l5.5 -5.5" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <Sparkles className="ic ic-sm spark" style={{ top: 6, left: 10 }} />
        <Sparkles className="ic ic-xs spark" style={{ bottom: 14, right: 2 }} />
      </div>
      <h2>
        Check your <span className="hl">inbox</span>
      </h2>
      <p className="sub" style={{ marginBottom: 16 }}>
        We’ve sent a verification link to
      </p>
      <span className="masked">
        <Mail className="ic ic-sm" style={{ color: "var(--accent)" }} />
        {email ? maskEmail(email) : "your email address"}
      </span>
      {info ? (
        <Notice tone="info" onDismiss={() => setInfo(null)}>
          {info}
        </Notice>
      ) : null}
      <a className="btn btn-primary btn-block" href={inbox?.url ?? "mailto:"} target="_blank" rel="noreferrer">
        {inbox?.label ?? "Open email app"}{" "}
        <span className="arrow">
          <ExternalLink className="ic ic-sm" />
        </span>
      </a>
      <div className="steps-mini">
        <div>
          <i>1</i>
          <span>
            Open the email from <b style={{ color: "var(--text)" }}>hello@jobai.com</b>
          </span>
        </div>
        <div>
          <i>2</i>
          <span>
            Click <b style={{ color: "var(--text)" }}>“Verify my email”</b> — link expires in 24h
          </span>
        </div>
        <div>
          <i>3</i>
          <span>
            Come back here and <Link href="/login" style={{ color: "var(--primary)", fontWeight: 700 }}>log in</Link> to finish setting up your profile
          </span>
        </div>
      </div>
      <p className="alt">
        Didn’t receive the email?{" "}
        <button
          type="button"
          className="link-btn"
          onClick={() => setInfo("Resending isn't available yet. Check your spam folder, or sign up again in a few minutes.")}
        >
          <RefreshCw className="ic ic-xs" style={{ verticalAlign: "-2px" }} /> Resend email
        </button>
      </p>
      <p style={{ fontSize: 12.5, color: "var(--faint)", marginTop: 8 }}>
        Check your spam folder · Wrong address?{" "}
        <Link style={{ color: "var(--primary)", fontWeight: 700 }} href="/signup">
          Change email
        </Link>
      </p>
    </div>
  );
}
