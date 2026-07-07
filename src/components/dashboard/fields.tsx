"use client";

import * as React from "react";
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Generate a stable, unique id for label↔input wiring. React's useId is
// SSR-safe and avoids the module-level counter side-effect that the lint
// rule (rightly) flags.
function useFieldId(prefix: string) {
  const raw = React.useId();
  // useId returns ":r0:"-style strings; sanitize to a valid HTML id.
  return `${prefix}-${raw.replace(/[:]/g, "")}`;
}

/**
 * Field — a labelled wrapper for form controls.
 *
 * IMPORTANT: this used to render a bare `<label>` element. That was the root
 * cause of a nasty bug: clicking any blank space inside the field synthesized
 * a click on the *first labelable descendant* (the × button of the leftmost
 * tag chip in `TagInput`), silently deleting that tag. Per the HTML spec a
 * `<label>` forwards clicks to its first labelable control when the click
 * target isn't itself a form control.
 *
 * Fix: render a `<div>` wrapper with an explicit `<label htmlFor={id}>` that
 * points at the actual input. This preserves accessibility (clicking the
 * label text still focuses the input) without the click-forwarding side
 * effect on non-control children.
 */
export function Field({
  label,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  const autoId = useFieldId("field");
  const target = htmlFor ?? autoId;
  return (
    <div className="block">
      <span className="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-dim">
        <label htmlFor={target}>{label}</label>
        {hint && <span className="text-dim/50 normal-case tracking-normal">· {hint}</span>}
      </span>
      {children}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  const id = useFieldId("text");
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-dim/40 bg-surface/70 font-mono text-sm text-foreground placeholder:text-dim/50 focus:border-teal/40"
      />
    </Field>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  hint?: string;
}) {
  const id = useFieldId("area");
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="resize-none border-dim/40 bg-surface/70 font-mono text-sm text-foreground placeholder:text-dim/50 focus:border-teal/40"
      />
    </Field>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
}) {
  const id = useFieldId("num");
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <Input
        id={id}
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="border-dim/40 bg-surface/70 font-mono text-sm text-foreground focus:border-teal/40"
      />
    </Field>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  hint?: string;
}) {
  const id = useFieldId("sel");
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-dim/40 bg-surface/70 px-3 py-2 font-mono text-sm text-foreground focus:border-teal/40 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-surface text-foreground">
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function ToggleField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5">
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={cn(
          "relative h-5 w-9 rounded-full border transition-colors",
          value ? "border-teal/40 bg-teal/20" : "border-line bg-surface"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-3.5 w-3.5 rounded-full transition-transform",
            value ? "translate-x-4 bg-teal" : "translate-x-0.5 bg-dim"
          )}
        />
      </button>
      <span className="font-mono text-[10px] uppercase tracking-wider text-dim">
        {label}
        {hint && <span className="ml-1 text-dim/50 normal-case tracking-normal">· {hint}</span>}
      </span>
    </label>
  );
}

export function TagInput({
  label,
  values,
  onChange,
  placeholder = "type, press enter",
  hint,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  hint?: string;
}) {
  const [input, setInput] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const add = () => {
    const v = input.trim();
    if (v && !values.includes(v)) {
      onChange([...values, v]);
    }
    setInput("");
  };
  const remove = (val: string) => {
    onChange(values.filter((v) => v !== val));
  };

  // Backspace on an empty input removes the last tag — a standard chip-input
  // affordance. Only triggers when the input is truly empty so normal typing
  // is never interrupted.
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      add();
      return;
    }
    if (e.key === "Backspace" && input === "" && values.length > 0) {
      e.preventDefault();
      remove(values[values.length - 1]);
    }
  };

  return (
    <Field label={label} hint={hint}>
      {/*
        NOTE: this container is a plain <div>, NOT a <label>. A <label> here
        would forward blank-space clicks to the first labelable descendant
        (the × button of the leftmost chip) and silently delete that tag.
        Clicking blank space now just focuses the input via the onClick below.
      */}
      <div
        className="rounded-md border border-dim/40 bg-surface/70 p-2 focus-within:border-teal/40"
        onClick={() => inputRef.current?.focus()}
      >
        {/* tag chips — keyed by the tag value itself (unique) */}
        <div className="flex flex-wrap gap-1.5">
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded border border-teal/30 bg-teal/10 px-1.5 py-0.5 font-mono text-[10px] text-teal"
            >
              {v}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(v);
                }}
                className="ml-0.5 flex h-3.5 w-3.5 items-center justify-center rounded text-teal/60 hover:bg-teal/20 hover:text-teal"
                aria-label={`Remove ${v}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        {/* input + explicit Add button */}
        <div className="mt-1.5 flex items-center gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={values.length ? "" : placeholder}
            className="flex-1 bg-transparent font-mono text-xs text-foreground placeholder:text-dim/50 focus:outline-none"
          />
          {input.trim() && (
            <button
              type="button"
              onClick={add}
              className="flex h-5 items-center gap-1 rounded border border-teal/40 bg-teal/10 px-1.5 font-mono text-[10px] text-teal hover:bg-teal/20"
            >
              <Plus className="h-2.5 w-2.5" />
              Add
            </button>
          )}
        </div>
        {/* hint */}
        <p className="mt-1 font-mono text-[9px] text-dim/50">
          Type, then press Enter or click Add. Click × on a tag to remove it. Backspace removes the last tag.
        </p>
      </div>
    </Field>
  );
}

export function ListEditor<T>({
  items,
  onChange,
  renderItem,
  makeNew,
  itemLabel,
  addLabel,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, update: (patch: Partial<T>) => void) => React.ReactNode;
  makeNew: () => T;
  itemLabel: (item: T, index: number) => string;
  addLabel: string;
}) {
  // Track the open item by INDEX, not by a uid derived from object identity.
  // The previous implementation keyed the open state on a WeakMap uid tied to
  // the item *object*. Editing an item replaced it with a new object (via
  // spread), which minted a new uid, so `openUid` no longer matched and the
  // panel collapsed on every keystroke. Index-based tracking is stable as
  // long as we adjust it on delete/reorder (see clampOpenIndex below).
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  // If the open index falls out of range after a delete/reorder, clamp it.
  // On delete of the open item we close the panel; on delete of an item above
  // the open item we shift the open index down by one.
  React.useEffect(() => {
    if (openIndex === null) return;
    if (openIndex >= items.length) {
      setOpenIndex(items.length === 0 ? null : items.length - 1);
    }
  }, [items.length, openIndex]);

  const update = (i: number, patch: Partial<T>) => {
    onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
    // openIndex stays `i` — no collapse.
  };
  const remove = (i: number) => {
    onChange(items.filter((_, j) => j !== i));
    if (openIndex === i) {
      setOpenIndex(null);
    } else if (openIndex !== null && i < openIndex) {
      setOpenIndex(openIndex - 1);
    }
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    if (openIndex === i) setOpenIndex(j);
    else if (openIndex === j) setOpenIndex(i);
  };
  const add = () => {
    onChange([...items, makeNew()]);
    setOpenIndex(items.length); // open the newly added item (its new index)
  };

  // Stop click/mouse propagation so interactions inside the action buttons or
  // open body don't bubble to the header toggle. NOTE: we intentionally do
  // NOT call preventDefault() on mousedown here — that was breaking
  // click-focus on the buttons (keyboard users could still Tab to them, but
  // click-focus is the expected behaviour).
  const stop = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className={cn(
              "overflow-hidden rounded-xl border bg-surface/60 transition-colors",
              isOpen ? "border-teal/30" : "border-dim/40"
            )}
          >
            <div className="flex items-center gap-2 px-3 py-2">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex flex-1 items-center gap-2 text-left"
              >
                <GripVertical className="h-3.5 w-3.5 shrink-0 text-dim/50" />
                <span className="truncate font-mono text-xs font-medium text-foreground/90">
                  {itemLabel(item, i)}
                </span>
              </button>
              <div className="flex items-center gap-0.5" onClick={stop} onMouseDown={stop}>
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="flex h-6 w-6 items-center justify-center rounded text-dim hover:text-teal disabled:opacity-30 disabled:hover:text-dim"
                  aria-label="Move up"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1}
                  className="flex h-6 w-6 items-center justify-center rounded text-dim hover:text-teal disabled:opacity-30 disabled:hover:text-dim"
                  aria-label="Move down"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete "${itemLabel(item, i)}"?`)) remove(i);
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded text-dim hover:text-destructive"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            {isOpen && (
              <div
                className="space-y-3 border-t border-line p-3"
                onClick={(e) => e.stopPropagation()}
              >
                {renderItem(item, (patch) => update(i, patch))}
              </div>
            )}
          </div>
        );
      })}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={add}
        className="gap-1.5 border-dashed border-line font-mono text-xs text-dim hover:border-teal/40 hover:text-teal"
      >
        <Plus className="h-3.5 w-3.5" />
        {addLabel}
      </Button>
    </div>
  );
}

export function SectionCard({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dim/30 bg-surface/30 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-foreground/80">
          {title}
        </h3>
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
