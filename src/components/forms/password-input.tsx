"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { useState, type ClipboardEvent, type ComponentProps, type DragEvent, type ReactNode } from "react";
import { FieldShell, InputBox } from "./field";

type Props = Omit<ComponentProps<"input">, "id" | "type"> & {
  id: string;
  label: ReactNode;
  labelExtra?: ReactNode;
  error?: string;
  hint?: ReactNode;
  state?: "ok" | "";
  stateIcon?: ReactNode;
  /** Blocks copy, cut, paste and drop (used on the reset-password fields). */
  blockClipboard?: boolean;
  onClipboardBlocked?: () => void;
};

export function PasswordField({
  id,
  label,
  labelExtra,
  error,
  hint,
  state = "",
  stateIcon,
  required,
  blockClipboard,
  onClipboardBlocked,
  ...inputProps
}: Props) {
  const [visible, setVisible] = useState(false);
  const Toggle = visible ? EyeOff : Eye;
  const block = (event: ClipboardEvent<HTMLInputElement> | DragEvent<HTMLInputElement>) => {
    event.preventDefault();
    onClipboardBlocked?.();
  };
  const clipboardHandlers = blockClipboard
    ? { onCopy: block, onCut: block, onPaste: block, onDrop: block, onDragStart: block }
    : {};
  return (
    <FieldShell id={id} label={label} labelExtra={labelExtra} error={error} hint={hint} required={required}>
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
          aria-required={required || undefined}
          {...inputProps}
          {...clipboardHandlers}
        />
      </InputBox>
    </FieldShell>
  );
}
