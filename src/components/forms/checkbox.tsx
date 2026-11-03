import { Check } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

type Props = Omit<ComponentProps<"input">, "type"> & { checked: boolean; children: ReactNode };

/** Design checkbox (`.check` + `.box`) backed by a native, visually hidden input. */
export function Checkbox({ checked, children, style, ...inputProps }: Props) {
  return (
    <label className="check" style={{ position: "relative", ...style }}>
      <input type="checkbox" checked={checked} suppressHydrationWarning {...inputProps} />
      <span className={`box ${checked ? "on" : ""}`}>
        {checked ? <Check className="ic ic-xs" style={{ width: 12, height: 12, strokeWidth: 3 }} /> : null}
      </span>
      <span>{children}</span>
    </label>
  );
}
