"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, Mail, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Checkbox } from "@/components/forms/checkbox";
import { RequiredMark, TextField } from "@/components/forms/field";
import { PasswordField } from "@/components/forms/password-input";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { useSignup } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api/errors";
import { signupSchema, type SignupValues } from "@/lib/validation/auth";
import { MissingPasswordRules } from "./password-rules";
import { SocialButtons, socialUnavailableMessage } from "./social-buttons";

export function SignupForm() {
  const router = useRouter();
  const signup = useSignup();
  const [info, setInfo] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, dirtyFields },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    mode: "onTouched",
    defaultValues: { fullName: "", email: "", password: "", terms: false },
  });
  const terms = useWatch({ control, name: "terms" });
  const email = useWatch({ control, name: "email" });
  const password = useWatch({ control, name: "password" });
  // Unmet password rules are listed by MissingPasswordRules, so the field shows no duplicate message.
  const passwordRulesFailed = errors.password?.type === "custom";
  const emailOk = dirtyFields.email && !errors.email && signupSchema.shape.email.safeParse(email).success;

  const onSubmit = handleSubmit(({ fullName, email, password }) => {
    setInfo(null);
    signup.mutate(
      { full_name: fullName, email, password },
      {
        onSuccess: (result) => {
          router.replace(result.email_confirmation_required ? "/verify-email" : "/onboarding/basic");
        },
      },
    );
  });

  const error = signup.error instanceof ApiError ? signup.error : null;

  return (
    <div className="auth-card">
      <h2>
        Create your <span className="hl">free account</span>
      </h2>
      <p className="sub">Start getting AI-matched jobs in under 3 minutes.</p>
      {error ? (
        <Notice tone="err">
          {error.status === 409 || error.code === "conflict" ? (
            <>
              An account with this email already exists. <Link href="/login">Log in instead</Link>
            </>
          ) : (
            error.message
          )}
        </Notice>
      ) : null}
      {info ? (
        <Notice tone="info" onDismiss={() => setInfo(null)}>
          {info}
        </Notice>
      ) : null}
      <SocialButtons onSelect={(p) => setInfo(socialUnavailableMessage(p))} />
      <div className="divider">or sign up with email</div>
      <form onSubmit={onSubmit} noValidate>
        <TextField
          id="signup-name"
          label="Full name"
          icon={User}
          autoComplete="name"
          placeholder="Jessica Morgan"
          required
          error={errors.fullName?.message ?? error?.fieldErrors.full_name}
          {...register("fullName")}
        />
        <TextField
          id="signup-email"
          label="Email address"
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          state={emailOk ? "ok" : ""}
          trailing={emailOk ? <CircleCheck className="ic ic-sm state" /> : null}
          error={errors.email?.message ?? error?.fieldErrors.email}
          {...register("email")}
        />
        <PasswordField
          id="signup-password"
          label="Password"
          autoComplete="new-password"
          placeholder="Create a password"
          required
          aria-describedby="signup-password-rules"
          invalid={passwordRulesFailed}
          error={(passwordRulesFailed ? undefined : errors.password?.message) ?? error?.fieldErrors.password}
          {...register("password")}
        />
        <MissingPasswordRules id="signup-password-rules" value={password} />
        <div style={{ margin: "20px 0 22px" }}>
          <Checkbox checked={terms} onChange={(e) => setValue("terms", e.target.checked, { shouldValidate: true })}>
            I agree to the <Link href="#">Terms of Service</Link> and <Link href="#">Privacy Policy</Link>
            <RequiredMark />
          </Checkbox>
          {errors.terms ? (
            <div className="field-err" role="alert">
              {errors.terms.message}
            </div>
          ) : null}
        </div>
        <Button type="submit" block arrow loading={signup.isPending}>
          {signup.isPending ? "Creating account…" : "Create Account"}
        </Button>
      </form>
      <p className="alt">
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </div>
  );
}
