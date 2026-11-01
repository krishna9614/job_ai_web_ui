"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { useState, type ComponentProps, type ReactNode } from "react";
import { FieldShell, InputBox } from "./field";

type Props = Omit<ComponentProps<"input">, "id" | "type"> & {
  id: string;
  label: ReactNode;
  labelExtra?: ReactNode;
  error?: string;
  hint?: ReactNode;
  state?: "ok" | "";
  stateIcon?: ReactNode;
};

export function PasswordField({ id, label, labelExtra, error, hint, state = "", stateIcon, ...inputProps }: Props) {
  const [visible, setVisible] = useState(false);
  const Toggle = visible ? EyeOff : Eye;
  return (
    <FieldShell id={id} label={label} labelExtra={labelExtra} error={error} hint={hint}>
      <InputBox
        icon={Lock}
        state={state}
        error={error}
        trailing={
          stateIcon ?? (
            <button
              type="button"
              className="toggle"
              onClick={() => setVisible((v) => !v)}
              aria-label={visible ? "Hide password" : "Show password"}
            >
              <Toggle className="ic ic-sm" />
            </button>
          )
        }
      >
        <input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...inputProps}
        />
      </InputBox>
    </FieldShell>
  );
}
