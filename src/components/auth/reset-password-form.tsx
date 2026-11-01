"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, Circle, CircleCheck, Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { PasswordField } from "@/components/forms/password-input";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { PASSWORD_RULES, passwordStrength, resetSchema, type ResetValues } from "@/lib/validation/auth";

/** Frame 06. Validates locally; the JobAI API does not expose a password-update endpoint yet. */
export function ResetPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    control,
    handleSubmit,
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

  return (
    <div className="auth-card">
      <div className="icon-tile" style={{ marginBottom: 20 }}>
        <Lock className="ic ic-lg" />
      </div>
      <h2>
        Set a <span className="hl">new password</span>
      </h2>
      <p className="sub">Choose a strong password for your JobAI account.</p>
      {submitted ? (
        <Notice tone="info" onDismiss={() => setSubmitted(false)}>
          Password changes aren’t available yet. Please contact support to reset your password.
        </Notice>
      ) : null}
      <form onSubmit={handleSubmit(() => setSubmitted(true))} noValidate>
        <PasswordField
          id="reset-password"
          label="New password"
          autoComplete="new-password"
          placeholder="Create a new password"
          error={errors.password?.message}
          {...register("password")}
        />
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
          <div className="reqs">
            {PASSWORD_RULES.map((rule) => {
              const ok = rule.test(password);
              return (
                <span key={rule.label} className={ok ? "ok" : "no"}>
                  {ok ? <CircleCheck className="ic ic-xs" /> : <Circle className="ic ic-xs" />}
                  {rule.label}
                </span>
              );
            })}
            <span className={password.length >= 16 ? "ok" : "no"}>
              {password.length >= 16 ? <CircleCheck className="ic ic-xs" /> : <Circle className="ic ic-xs" />}
              16+ characters (optional)
            </span>
          </div>
        </div>
        <PasswordField
          id="reset-confirm"
          label="Confirm new password"
          autoComplete="new-password"
          placeholder="Repeat your new password"
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
          {...register("confirm")}
        />
        <Button type="submit" block arrow style={{ marginTop: 10 }}>
          Save Password
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
