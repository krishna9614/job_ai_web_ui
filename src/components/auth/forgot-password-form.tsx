"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Clock, KeyRound, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { TextField } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { forgotSchema, type ForgotValues } from "@/lib/validation/auth";

/**
 * Frame 05. The JobAI API has no password-reset endpoint yet, so submitting validates the
 * email and explains that reset emails are not available instead of pretending to send one.
 */
export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotValues>({ resolver: zodResolver(forgotSchema), defaultValues: { email: "" } });

  return (
    <div className="auth-card center">
      <div className="illus" style={{ width: 104, height: 104, marginBottom: 22 }}>
        <span className="halo"></span>
        <span className="halo2"></span>
        <KeyRound className="ic main" style={{ width: 40, height: 40, color: "var(--primary)" }} />
      </div>
      <h2>
        Forgot your <span className="hl">password?</span>
      </h2>
      <p className="sub">No worries — enter the email linked to your account and we’ll send you a reset link.</p>
      {submitted ? (
        <Notice tone="info" onDismiss={() => setSubmitted(false)}>
          Password reset emails aren’t available yet. Please contact support to regain access to your account.
        </Notice>
      ) : null}
      <form onSubmit={handleSubmit(() => setSubmitted(true))} noValidate style={{ textAlign: "left" }}>
        <TextField
          id="forgot-email"
          label="Email address"
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <Button type="submit" block arrow style={{ marginTop: 8 }}>
          Send Reset Link
        </Button>
      </form>
      <Link className="back-link" href="/login">
        <ArrowLeft className="ic ic-sm" />
        Back to Login
      </Link>
      <div className="side-note" style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid #EEF2EE" }}>
        <Clock className="ic ic-sm" />
        Reset links expire after 30 minutes for your security
      </div>
    </div>
  );
}
