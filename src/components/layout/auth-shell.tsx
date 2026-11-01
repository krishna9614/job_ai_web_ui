import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { LeafShape, SprigShape } from "@/components/icons/brand";

type Variant = "left" | "right" | "onboarding";

const LEAVES: Record<Variant, { shape: "leaf" | "sprig"; style: CSSProperties }[]> = {
  left: [
    { shape: "leaf", style: { top: -70, left: -70, width: 300, height: 300, color: "#E7F1E9", transform: "rotate(140deg)" } },
    { shape: "sprig", style: { bottom: -30, right: 40, width: 140, height: 230, color: "#D3E7DA", transform: "rotate(-24deg)" } },
    { shape: "leaf", style: { bottom: -90, right: -90, width: 300, height: 300, color: "#E7F1E9", transform: "rotate(-40deg)" } },
  ],
  right: [
    { shape: "leaf", style: { top: -80, right: -80, width: 320, height: 320, color: "#E7F1E9", transform: "rotate(-140deg)" } },
    { shape: "sprig", style: { bottom: -20, left: 50, width: 140, height: 230, color: "#D3E7DA", transform: "rotate(20deg)" } },
    { shape: "leaf", style: { bottom: -100, left: -100, width: 300, height: 300, color: "#E7F1E9", transform: "rotate(40deg)" } },
  ],
  onboarding: [
    { shape: "leaf", style: { top: -80, right: -60, width: 280, height: 280, color: "#E7F1E9", transform: "rotate(200deg)" } },
    { shape: "sprig", style: { bottom: -40, left: 30, width: 130, height: 220, color: "#D3E7DA", transform: "rotate(18deg)" } },
    { shape: "leaf", style: { bottom: -100, left: -100, width: 300, height: 300, color: "#E7F1E9", transform: "rotate(40deg)" } },
  ],
};

export function Leaves({ variant }: { variant: Variant }) {
  return (
    <>
      {LEAVES[variant].map(({ shape, style }, i) =>
        shape === "leaf" ? (
          <LeafShape key={i} className="leaf" style={style} />
        ) : (
          <SprigShape key={i} className="leaf" style={style} />
        ),
      )}
    </>
  );
}

export function AuthFooter() {
  return (
    <div className="auth-foot">
      © 2026 JobAI · <Link href="#">Privacy</Link> · <Link href="#">Terms</Link>
    </div>
  );
}

/** Full-page layout shared by the authentication screens (frames 02–06). */
export function AuthShell({
  variant,
  topRight,
  children,
}: {
  variant: "left" | "right";
  topRight: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="auth">
      <Leaves variant={variant} />
      <div className="auth-top">
        <Logo />
        <span className="help">{topRight}</span>
      </div>
      <div className="auth-body">{children}</div>
      <AuthFooter />
    </main>
  );
}
