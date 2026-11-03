import { Circle, CircleCheck } from "lucide-react";
import { PASSWORD_RULES } from "@/lib/validation/auth";

/** Live checklist of the password policy shared with the backend; `invalid` flags unmet rules in red. */
export function PasswordRules({ id, value, invalid }: { id?: string; value: string; invalid?: boolean }) {
  return (
    <div className="reqs" id={id} aria-label="Password requirements" style={{ marginTop: -8, marginBottom: 14 }}>
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(value);
        return (
          <span key={rule.label} className={ok ? "ok" : invalid ? "no err" : "no"}>
            {ok ? <CircleCheck className="ic ic-xs" /> : <Circle className="ic ic-xs" />}
            {rule.label}
          </span>
        );
      })}
    </div>
  );
}
