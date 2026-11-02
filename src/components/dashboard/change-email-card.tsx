"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { TextField } from "@/components/forms/field";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { useRequestEmailChange } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api/errors";
import { emailChangeSchema, type EmailChangeValues } from "@/lib/validation/auth";

/** POST /users/me/email-change. The email only changes once the emailed link is confirmed. */
export function ChangeEmailCard({ currentEmail }: { currentEmail: string }) {
  const [open, setOpen] = useState(false);
  const change = useRequestEmailChange();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmailChangeValues>({ resolver: zodResolver(emailChangeSchema), defaultValues: { email: "" } });
  const error = change.error instanceof ApiError ? change.error : null;

  const close = () => {
    setOpen(false);
    reset();
    change.reset();
  };

  return (
    <div className="card acct-card">
      <h3>Email address</h3>
      {change.isSuccess ? (
        <Notice tone="ok" onDismiss={close}>
          {change.data.detail} Open the links we sent to confirm the change. Until then you keep using {currentEmail}.
        </Notice>
      ) : open ? (
        <form onSubmit={handleSubmit(({ email }) => change.mutate(email))} noValidate>
          {error && !error.fieldErrors.email ? <Notice tone="err">{error.message}</Notice> : null}
          <TextField
            id="change-email"
            label="New email address"
            icon={Mail}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            error={errors.email?.message ?? error?.fieldErrors.email ?? (error?.status === 409 || error?.status === 422 ? error.message : undefined)}
            {...register("email")}
          />
          <div className="done-ctas" style={{ justifyContent: "flex-start", marginTop: 4 }}>
            <Button type="submit" size="sm" loading={change.isPending}>
              {change.isPending ? "Sending…" : "Send confirmation"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={close}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <>
          <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>
            Signed in as <b style={{ color: "var(--text)", overflowWrap: "anywhere" }}>{currentEmail}</b>
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
            <Mail className="ic ic-sm" />
            Change email
          </Button>
        </>
      )}
    </div>
  );
}
