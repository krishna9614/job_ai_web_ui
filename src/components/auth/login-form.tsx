"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Checkbox } from "@/components/forms/checkbox";
import { TextField } from "@/components/forms/field";
import { PasswordField } from "@/components/forms/password-input";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { useLogin, useResendVerification } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api/errors";
import { safeNextPath } from "@/lib/navigation";
import { loginSchema, type LoginValues } from "@/lib/validation/auth";
import { useAuthStore } from "@/stores/auth-store";
import { SocialButtons, socialUnavailableMessage } from "./social-buttons";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();
  const resend = useResendVerification();
  const sessionExpired = useAuthStore((s) => s.sessionExpired);
  const [info, setInfo] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: true },
  });
  const remember = useWatch({ control, name: "remember" });

  const onSubmit = handleSubmit((values) => {
    setInfo(null);
    resend.reset();
    login.mutate(values, {
      onSuccess: () => router.replace(safeNextPath(searchParams.get("next")) ?? "/dashboard"),
    });
  });

  const error = login.error instanceof ApiError ? login.error : null;
  const unverified = error?.status === 403 && /confirm/i.test(error.message);
  const resendError = resend.error instanceof ApiError ? resend.error : null;

  return (
    <div className="auth-card">
      <h2>
        Welcome <span className="hl">back</span>
      </h2>
      <p className="sub">Log in to continue your job search.</p>
      {sessionExpired && !error && !info ? (
        <Notice tone="info">Your session has ended. Please log in again.</Notice>
      ) : null}
      {error && unverified ? (
        <Notice tone={resend.isSuccess ? "ok" : "err"}>
          {resend.isSuccess ? (
            resend.data.detail
          ) : (
            <>
              Please verify your email before logging in.{" "}
              <button
                type="button"
                className="link-btn"
                disabled={resend.isPending}
                onClick={() => resend.mutate(getValues("email"))}
              >
                {resend.isPending ? "Sending…" : "Resend verification email"}
              </button>
              {resendError ? <> — {resendError.message}</> : null}
            </>
          )}
        </Notice>
      ) : error ? (
        <Notice tone="err">
          {error.status === 401 ? "Incorrect email or password. Please try again." : error.message}
        </Notice>
      ) : null}
      {info ? (
        <Notice tone="info" onDismiss={() => setInfo(null)}>
          {info}
        </Notice>
      ) : null}
      <SocialButtons onSelect={(p) => setInfo(socialUnavailableMessage(p))} />
      <div className="divider">or</div>
      <form onSubmit={onSubmit} noValidate>
        <TextField
          id="login-email"
          label="Email address"
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordField
          id="login-password"
          label="Password"
          autoComplete="current-password"
          placeholder="Enter your password"
          required
          error={errors.password?.message}
          {...register("password")}
        />
        <div className="row-between">
          <Checkbox checked={remember} onChange={(e) => setValue("remember", e.target.checked)}>
            Remember me for 30 days
          </Checkbox>
          <Link href="/forgot-password">Forgot password?</Link>
        </div>
        <Button type="submit" block arrow loading={login.isPending}>
          {login.isPending ? "Logging in…" : "Log In"}
        </Button>
      </form>
      <p className="alt">
        Don’t have an account? <Link href="/signup">Sign up free</Link>
      </p>
      <div className="side-note">
        <ShieldCheck className="ic ic-sm" />
        Protected by 256-bit encryption
      </div>
    </div>
  );
}
