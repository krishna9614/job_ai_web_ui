"use client";

import { ExternalLink, Mail, RefreshCw, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { TextField } from "@/components/forms/field";
import { Notice } from "@/components/ui/notice";
import { useResendVerification } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api/errors";
import { maskEmail } from "@/lib/profile/format";
import { forgotSchema } from "@/lib/validation/auth";
import { useAuthStore } from "@/stores/auth-store";

const RESEND_COOLDOWN_SECONDS = 60;

const LINK_STATUS: Record<string, string> = {
  invalid: "This verification link is invalid, has expired or has already been used. Request a new one below.",
  unavailable: "We couldn't reach JobAI to verify your email. Please try the link again shortly.",
};

const INBOXES: Record<string, { label: string; url: string }> = {
  "gmail.com": { label: "Open Gmail", url: "https://mail.google.com/" },
  "googlemail.com": { label: "Open Gmail", url: "https://mail.google.com/" },
  "outlook.com": { label: "Open Outlook", url: "https://outlook.live.com/mail/" },
  "hotmail.com": { label: "Open Outlook", url: "https://outlook.live.com/mail/" },
  "yahoo.com": { label: "Open Yahoo Mail", url: "https://mail.yahoo.com/" },
  "icloud.com": { label: "Open iCloud Mail", url: "https://www.icloud.com/mail" },
};

export function VerifyEmailCard() {
  const pendingEmail = useAuthStore((s) => s.pendingVerificationEmail);
  const setPendingEmail = useAuthStore((s) => s.setPendingVerificationEmail);
  const linkStatus = LINK_STATUS[useSearchParams().get("status") ?? ""];
  const resend = useResendVerification();
  const [typedEmail, setTypedEmail] = useState("");
  const [emailError, setEmailError] = useState<string>();
  const [cooldown, setCooldown] = useState(0);
  const email = pendingEmail;

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const onResend = () => {
    const target = email ?? typedEmail.trim();
    const parsed = forgotSchema.shape.email.safeParse(target);
    if (!parsed.success) {
      setEmailError(parsed.error.issues[0]?.message);
      return;
    }
    setEmailError(undefined);
    resend.mutate(parsed.data, {
      onSuccess: () => {
        setPendingEmail(parsed.data);
        setCooldown(RESEND_COOLDOWN_SECONDS);
      },
    });
  };
  const resendError = resend.error instanceof ApiError ? resend.error : null;
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
      {linkStatus && !resend.isSuccess ? <Notice tone="err">{linkStatus}</Notice> : null}
      {resend.isSuccess ? (
        <Notice tone="ok" onDismiss={resend.reset}>
          {resend.data.detail}
        </Notice>
      ) : null}
      {resendError ? <Notice tone="err">{resendError.message}</Notice> : null}
      {email ? null : (
        <div style={{ textAlign: "left", width: "100%" }}>
          <TextField
            id="verify-email"
            label="Email address"
            icon={Mail}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            value={typedEmail}
            error={emailError}
            onChange={(e) => setTypedEmail(e.target.value)}
          />
        </div>
      )}
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
            Click <b style={{ color: "var(--text)" }}>“Verify my email”</b> — the link works once
          </span>
        </div>
        <div>
          <i>3</i>
          <span>
            You’ll be signed in to finish setting up your profile, or{" "}
            <Link href="/login" style={{ color: "var(--primary)", fontWeight: 700 }}>log in</Link> here
          </span>
        </div>
      </div>
      <p className="alt">
        Didn’t receive the email?{" "}
        <button type="button" className="link-btn" onClick={onResend} disabled={resend.isPending || cooldown > 0}>
          <RefreshCw className="ic ic-xs" style={{ verticalAlign: "-2px" }} />{" "}
          {resend.isPending ? "Sending…" : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}
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
