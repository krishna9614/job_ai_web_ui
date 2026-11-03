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

/** Only the rules `value` still fails, in red; nothing while the field is empty or every rule passes. */
export function MissingPasswordRules({ id, value }: { id?: string; value: string }) {
  const missing = value ? PASSWORD_RULES.filter((rule) => !rule.test(value)) : [];
  return (
    <div id={id} aria-live="polite">
      {missing.length ? (
        <div className="field-err pw-missing">
          <span>Missing:</span>
          <ul>
            {missing.map((rule) => (
              <li key={rule.label}>{rule.label}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
