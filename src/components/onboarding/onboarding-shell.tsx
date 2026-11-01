import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { Fragment, type CSSProperties, type ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { Leaves } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { ONBOARDING_STEPS, stepHref, strengthLabel } from "./steps";

export function StrengthRing({ value, size = "sm" }: { value: number; size?: "sm" | "lg" }) {
  return (
    <div className={`ring ring-${size}`} style={{ "--p": `${value}%` } as CSSProperties}>
      <span>
        {value}%{size === "lg" ? <small>Profile strength</small> : null}
      </span>
    </div>
  );
}

export function OnboardingTop({ right }: { right: ReactNode }) {
  return (
    <div className="auth-top">
      <Logo />
      <span className="help">{right}</span>
    </div>
  );
}

/** Frames 07–12: top bar, 6-step stepper, heading with profile strength, footer navigation. */
export function OnboardingShell({
  stepIndex,
  title,
  description,
  children,
  footer,
}: {
  stepIndex: number;
  title: ReactNode;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  const strength = ONBOARDING_STEPS[stepIndex].strength;
  return (
    <main className="auth ob">
      <Leaves variant="onboarding" />
      <OnboardingTop
        right={
          <>
            Step {stepIndex + 1} of {ONBOARDING_STEPS.length}
            <span className="sep"></span>
            <Link href="/dashboard">Save &amp; exit</Link>
          </>
        }
      />
      <div className="ob-body">
        <div className="ob-card">
          <nav className="ob-stepper" aria-label="Profile setup progress">
            {ONBOARDING_STEPS.map((step, i) => {
              const state = i < stepIndex ? "done" : i === stepIndex ? "current" : "";
              const Icon = i < stepIndex ? Check : step.icon;
              const node = (
                <>
                  <span className="node">
                    <Icon className="ic" />
                  </span>
                  {step.label}
                </>
              );
              return (
                <Fragment key={step.slug}>
                  {i > 0 ? <span className={`ob-line ${i <= stepIndex ? "done" : ""}`}></span> : null}
                  {i < stepIndex ? (
                    <Link className={`ob-step ${state}`} href={stepHref(i)}>
                      {node}
                    </Link>
                  ) : (
                    <div className={`ob-step ${state}`} aria-current={i === stepIndex ? "step" : undefined}>
                      {node}
                    </div>
                  )}
                </Fragment>
              );
            })}
          </nav>
          <div className="ob-head">
            <div>
              <h2>{title}</h2>
              <p>{description}</p>
            </div>
            <div className="ob-strength">
              <StrengthRing value={strength} />
              <div>
                <b>Profile strength</b>
                <small>{strengthLabel(strength)}</small>
              </div>
            </div>
          </div>
          {children}
          {footer}
        </div>
      </div>
    </main>
  );
}

export function OnboardingFooter({
  stepIndex,
  onContinue,
  continueLabel = "Continue",
  loading,
  skip,
}: {
  stepIndex: number;
  onContinue?: () => void;
  continueLabel?: string;
  loading?: boolean;
  skip?: boolean;
}) {
  return (
    <div className="ob-foot">
      {stepIndex > 0 ? (
        <Link className="btn btn-ghost btn-sm" href={stepHref(stepIndex - 1)}>
          <ArrowLeft className="ic ic-sm" />
          Back
        </Link>
      ) : (
        <span></span>
      )}
      {skip ? (
        <Link className="skip" href={stepHref(stepIndex + 1)}>
          Skip for now
        </Link>
      ) : (
        <span></span>
      )}
      <Button
        type={onContinue ? "button" : "submit"}
        size="sm"
        arrow
        loading={loading}
        onClick={onContinue}
      >
        {continueLabel}
      </Button>
    </div>
  );
}
