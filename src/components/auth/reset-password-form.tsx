"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, CircleCheck, Lock, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { PasswordField } from "@/components/forms/password-input";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { useResetPassword } from "@/hooks/use-auth";
import { ApiError, toApiError } from "@/lib/api/errors";
import { passwordStrength, resetSchema, type ResetValues } from "@/lib/validation/auth";
import { authService } from "@/services/auth.service";
import { MissingPasswordRules } from "./password-rules";

type Phase = "checking" | "ready" | "invalid" | "done";

const INVALID_LINK = "This reset link is invalid, has expired or has already been used.";

/**
 * Frame 06. Opened from the reset email (?token_hash=...): the one-time token is exchanged for
 * a recovery session kept in an HttpOnly cookie, then POST /auth/password/reset sets the password.
 */
export function ResetPasswordForm() {
  const router = useRouter();
  const tokenHash = useSearchParams().get("token_hash");
  const reset = useResetPassword();
  const [phase, setPhase] = useState<Phase>("checking");
  const [linkError, setLinkError] = useState(INVALID_LINK);
  const [clipboardNote, setClipboardNote] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const check = tokenHash
      ? authService.startRecovery(tokenHash).then(() => {
          // Drop the consumed token from the address bar; a reload reuses the cookie instead.
          router.replace("/reset-password");
          return true;
        })
      : authService.recoveryStatus();
    check
      .then((active) => setPhase(active ? "ready" : "invalid"))
      .catch((err: unknown) => {
        const apiError = toApiError(err);
        setLinkError(apiError.code === "invalid_token" ? INVALID_LINK : apiError.message);
        setPhase("invalid");
      });
  }, [tokenHash, router]);

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    mode: "onTouched",
    defaultValues: { password: "", confirm: "" },
  });
  const password = useWatch({ control, name: "password" });
  const confirm = useWatch({ control, name: "confirm" });
  const strength = passwordStrength(password);
  const matches = confirm.length > 0 && confirm === password;
  // Unmet rules are listed by MissingPasswordRules, so the field shows no duplicate message.
  const passwordRulesFailed = errors.password?.type === "custom";

  const onSubmit = handleSubmit(({ password: value }) => {
    reset.mutate(value, {
      onSuccess: () => setPhase("done"),
      onError: (err) => {
        const apiError = toApiError(err);
        if (apiError.code === "password_reused" || apiError.fieldErrors.password) {
          setError("password", { message: apiError.fieldErrors.password ?? apiError.message });
        } else if (apiError.status === 401 || apiError.status === 403) {
          setLinkError("Your reset session has expired. Please request a new reset link.");
          setPhase("invalid");
        }
      },
    });
  });

  const error = reset.error instanceof ApiError ? reset.error : null;
  const formLevelError =
    error && error.code !== "password_reused" && !error.fieldErrors.password && phase === "ready" ? error : null;

  if (phase === "checking") {
    return (
      <div className="auth-card center" aria-busy="true">
        <div className="icon-tile" style={{ margin: "0 auto 20px" }}>
          <Lock className="ic ic-lg" />
        </div>
        <h2>
          Checking your <span className="hl">reset link</span>
        </h2>
        <p className="sub">Hang tight, this only takes a moment…</p>
      </div>
    );
  }

  if (phase === "invalid" || phase === "done") {
    const done = phase === "done";
    return (
      <div className="auth-card center">
        <div className="icon-tile" style={{ margin: "0 auto 20px" }}>
          {done ? <CircleCheck className="ic ic-lg" /> : <ShieldAlert className="ic ic-lg" />}
        </div>
        <h2>
          {done ? (
            <>
              Password <span className="hl">updated</span>
            </>
          ) : (
            <>
              Link <span className="hl">expired</span>
            </>
          )}
        </h2>
        <Notice tone={done ? "ok" : "err"}>
          {done
            ? "Your password has been reset and you've been signed out of all devices. Log in with your new password."
            : linkError}
        </Notice>
        {done ? (
          <Link className="btn btn-primary btn-block" href="/login">
            Go to Login
          </Link>
        ) : (
          <Link className="btn btn-primary btn-block" href="/forgot-password">
            Request a new link
          </Link>
        )}
        <Link className="back-link" href="/login">
          <ArrowLeft className="ic ic-sm" />
          Back to Login
        </Link>
      </div>
    );
  }

  const clipboardProps = { blockClipboard: true, onClipboardBlocked: () => setClipboardNote(true) };

  return (
    <div className="auth-card">
      <div className="icon-tile" style={{ marginBottom: 20 }}>
        <Lock className="ic ic-lg" />
      </div>
      <h2>
        Set a <span className="hl">new password</span>
      </h2>
      <p className="sub">Choose a strong password you haven’t used for your JobAI account.</p>
      {formLevelError ? <Notice tone="err">{formLevelError.message}</Notice> : null}
      {clipboardNote ? (
        <Notice tone="info" onDismiss={() => setClipboardNote(false)}>
          Copy and paste are disabled for these fields. Please type your new password.
        </Notice>
      ) : null}
      <form onSubmit={onSubmit} noValidate>
        <PasswordField
          id="reset-password"
          label="New password"
          autoComplete="new-password"
          placeholder="Create a new password"
          required
          aria-describedby="reset-password-rules"
          invalid={passwordRulesFailed}
          error={passwordRulesFailed ? undefined : errors.password?.message}
          {...clipboardProps}
          {...register("password")}
        />
        <MissingPasswordRules id="reset-password-rules" value={password} />
        <div className="strength">
          <div className="strength-bars">
            {[1, 2, 3, 4].map((n) => (
              <i key={n} className={password && strength.score >= n ? "on" : ""}></i>
            ))}
          </div>
          <div className="strength-head">
            <span>Password strength</span>
            <b>{password ? strength.label : "—"}</b>
          </div>
        </div>
        <PasswordField
          id="reset-confirm"
          label="Confirm new password"
          autoComplete="new-password"
          placeholder="Repeat your new password"
          required
          state={matches ? "ok" : ""}
          stateIcon={matches ? <CircleCheck className="ic ic-sm state" /> : undefined}
          error={errors.confirm?.message}
          hint={
            matches ? (
              <span className="hint ok" style={{ margin: 0 }}>
                <Check className="ic ic-xs" />
                Passwords match
              </span>
            ) : undefined
          }
          {...clipboardProps}
          {...register("confirm")}
        />
        <Button type="submit" block arrow loading={reset.isPending} style={{ marginTop: 10 }}>
          {reset.isPending ? "Saving…" : "Save Password"}
        </Button>
      </form>
      <div style={{ textAlign: "center" }}>
        <Link className="back-link" href="/login">
          <ArrowLeft className="ic ic-sm" />
          Back to Login
        </Link>
      </div>
    </div>
  );
}
