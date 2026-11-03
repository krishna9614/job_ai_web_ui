"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Clock, KeyRound, Mail } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { TextField } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { useForgotPassword } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api/errors";
import { forgotSchema, type ForgotValues } from "@/lib/validation/auth";

/** Frame 05. POST /auth/password/forgot; the reply never reveals whether the email is registered. */
export function ForgotPasswordForm() {
  const forgot = useForgotPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotValues>({ resolver: zodResolver(forgotSchema), defaultValues: { email: "" } });
  const error = forgot.error instanceof ApiError ? forgot.error : null;

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
      {forgot.isSuccess ? (
        <Notice tone="ok" onDismiss={forgot.reset}>
          {forgot.data.detail} Check your inbox and spam folder.
        </Notice>
      ) : null}
      {error ? <Notice tone="err">{error.message}</Notice> : null}
      <form onSubmit={handleSubmit(({ email }) => forgot.mutate(email))} noValidate style={{ textAlign: "left" }}>
        <TextField
          id="forgot-email"
          label="Email address"
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          error={errors.email?.message ?? error?.fieldErrors.email}
          {...register("email")}
        />
        <Button type="submit" block arrow loading={forgot.isPending} style={{ marginTop: 8 }}>
          {forgot.isPending ? "Sending…" : forgot.isSuccess ? "Send Again" : "Send Reset Link"}
        </Button>
      </form>
      <Link className="back-link" href="/login">
        <ArrowLeft className="ic ic-sm" />
        Back to Login
      </Link>
      <div className="side-note" style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid #EEF2EE" }}>
        <Clock className="ic ic-sm" />
        Reset links expire after 30 minutes and can be used once
      </div>
    </div>
  );
}
