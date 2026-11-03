import { Circle, CircleCheck } from "lucide-react";
import { PASSWORD_RULES } from "@/lib/validation/auth";

/** Live checklist of the password policy shared with the backend. */
export function PasswordRules({ id, value }: { id?: string; value: string }) {
  return (
    <div className="reqs" id={id} aria-label="Password requirements" style={{ marginTop: -8, marginBottom: 14 }}>
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(value);
        return (
          <span key={rule.label} className={ok ? "ok" : "no"}>
            {ok ? <CircleCheck className="ic ic-xs" /> : <Circle className="ic ic-xs" />}
            {rule.label}
          </span>
        );
      })}
    </div>
  );
}
