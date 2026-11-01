import { CircleAlert } from "lucide-react";
import type { ComponentProps, ComponentType, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FieldShellProps {
  id: string;
  label: ReactNode;
  labelExtra?: ReactNode;
  error?: string;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Label + control + error, matching the design's `.field` anatomy. */
export function FieldShell({ id, label, labelExtra, error, hint, className, children }: FieldShellProps) {
  return (
    <div className={cn("field", className)}>
      <label htmlFor={id}>
        <span>{label}</span>
        {labelExtra}
      </label>
      {children}
      {error ? (
        <div className="field-err" id={`${id}-error`}>
          <CircleAlert className="ic ic-xs" />
          {error}
        </div>
      ) : hint ? (
        <div className="hint">{hint}</div>
      ) : null}
    </div>
  );
}

type InputBoxProps = {
  icon?: ComponentType<{ className?: string }>;
  state?: "ok" | "locked" | "";
  error?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  boxClassName?: string;
};

export function InputBox({
  icon: Icon,
  state = "",
  error,
  leading,
  trailing,
  boxClassName,
  children,
}: InputBoxProps & { children: ReactNode }) {
  return (
    <div className={cn("input", state, error && "err", boxClassName)}>
      {leading}
      {Icon ? <Icon className="ic ic-sm" /> : null}
      {children}
      {trailing}
    </div>
  );
}

type TextFieldProps = Omit<ComponentProps<"input">, "id"> &
  InputBoxProps & {
    id: string;
    label: ReactNode;
    labelExtra?: ReactNode;
    hint?: ReactNode;
    fieldClassName?: string;
  };

export function TextField({
  id,
  label,
  labelExtra,
  hint,
  error,
  icon,
  state,
  leading,
  trailing,
  boxClassName,
  fieldClassName,
  ...inputProps
}: TextFieldProps) {
  return (
    <FieldShell id={id} label={label} labelExtra={labelExtra} error={error} hint={hint} className={fieldClassName}>
      <InputBox icon={icon} state={state} error={error} leading={leading} trailing={trailing} boxClassName={boxClassName}>
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          readOnly={state === "locked" || inputProps.readOnly}
          {...inputProps}
        />
      </InputBox>
    </FieldShell>
  );
}

type SelectFieldProps = Omit<ComponentProps<"select">, "id"> &
  InputBoxProps & {
    id: string;
    label: ReactNode;
    labelExtra?: ReactNode;
    options: readonly string[];
    placeholder?: string;
    fieldClassName?: string;
  };

export function SelectField({
  id,
  label,
  labelExtra,
  error,
  icon,
  options,
  placeholder,
  fieldClassName,
  ...selectProps
}: SelectFieldProps) {
  return (
    <FieldShell id={id} label={label} labelExtra={labelExtra} error={error} className={fieldClassName}>
      <InputBox icon={icon} error={error} trailing={<ChevronState />}>
        <select id={id} {...selectProps}>
          {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </InputBox>
    </FieldShell>
  );
}

function ChevronState() {
  return (
    <svg className="ic ic-sm state" viewBox="0 0 24 24" aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
