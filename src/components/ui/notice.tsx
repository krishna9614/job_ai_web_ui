import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import type { ReactNode } from "react";

type Tone = "ok" | "err" | "info";

const ICONS = { ok: CircleCheck, err: CircleAlert, info: Info } as const;

export function Notice({
  tone,
  children,
  action,
  onDismiss,
}: {
  tone: Tone;
  children: ReactNode;
  action?: ReactNode;
  onDismiss?: () => void;
}) {
  const Icon = ICONS[tone];
  return (
    <div className={`notice ${tone}`} role={tone === "err" ? "alert" : "status"}>
      <span className="tip-ic">
        <Icon className="ic ic-sm" />
      </span>
      <span className="grow">{children}</span>
      {action}
      {onDismiss ? (
        <button type="button" className="x" onClick={onDismiss} aria-label="Dismiss">
          <X className="ic ic-sm" />
        </button>
      ) : null}
    </div>
  );
}
