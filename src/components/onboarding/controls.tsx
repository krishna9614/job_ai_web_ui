"use client";

import { Check, Plus, X, type LucideIcon } from "lucide-react";
import { useId, useRef, useState, type KeyboardEvent } from "react";

/** Design `.tags` box: chips with remove buttons plus an inline "Add" entry (Enter to add). */
export function TagInput({
  values,
  onChange,
  addLabel = "Add",
  max,
  placeholder = "Type and press Enter",
  ariaLabel,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  addLabel?: string;
  max?: number;
  placeholder?: string;
  ariaLabel: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const full = max !== undefined && values.length >= max;

  const commit = () => {
    const value = draft.trim();
    if (value && !values.some((v) => v.toLowerCase() === value.toLowerCase()) && !full) {
      onChange([...values, value]);
    }
    setDraft("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      setDraft("");
      setEditing(false);
    } else if (e.key === "Backspace" && !draft && values.length) {
      onChange(values.slice(0, -1));
    }
  };

  return (
    <div className="tags" role="group" aria-label={ariaLabel} onClick={() => editing && inputRef.current?.focus()}>
      {values.map((v) => (
        <span className="tag" key={v}>
          {v}
          <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} aria-label={`Remove ${v}`}>
            <X className="ic" />
          </button>
        </span>
      ))}
      {editing && !full ? (
        <input
          ref={inputRef}
          autoFocus
          value={draft}
          placeholder={placeholder}
          aria-label={ariaLabel}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => {
            commit();
            setEditing(false);
          }}
        />
      ) : !full ? (
        <button type="button" className="tag-add" onClick={() => setEditing(true)}>
          <Plus className="ic" />
          {addLabel}
        </button>
      ) : null}
    </div>
  );
}

/** Design `.opt` pill: radio (round) or checkbox (square). */
export function OptionPill({
  label,
  selected,
  onSelect,
  square = false,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
  square?: boolean;
}) {
  return (
    <button
      type="button"
      className={`opt ${selected ? "on" : ""}`}
      role={square ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onSelect}
    >
      <span className={`rd ${square ? "sq" : ""}`}>{square && selected ? <Check className="ic" /> : null}</span>
      {label}
    </button>
  );
}

export function OptionCard({
  icon: Icon,
  title,
  caption,
  selected,
  onSelect,
}: {
  icon: LucideIcon;
  title: string;
  caption: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button type="button" className={`opt-card ${selected ? "on" : ""}`} role="radio" aria-checked={selected} onClick={onSelect}>
      <span className="oc-ic">
        <Icon className="ic ic-sm" />
      </span>
      <div>
        <b>{title}</b>
        <small>{caption}</small>
      </div>
      {selected ? (
        <span className="oc-check">
          <Check className="ic ic-xs" />
        </span>
      ) : null}
    </button>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  const id = useId();
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`switch ${checked ? "on" : ""}`}
      onClick={() => onChange(!checked)}
    />
  );
}
