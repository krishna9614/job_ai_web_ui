import { PASSWORD_RULES } from "@/lib/validation/auth";

/** Only the rules `value` still fails, in red; nothing while the field is empty or every rule passes. */
export function MissingPasswordRules({ id, value }: { id?: string; value: string }) {
  const missing = value ? PASSWORD_RULES.filter((rule) => !rule.test(value)) : [];
  return (
    <div id={id} aria-live="polite">
      {missing.length ? (
        <div className="field-err pw-missing">
          {/* <span>Missing:</span> */}
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
