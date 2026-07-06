"use client";

import * as React from "react";
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-dim">
        {label}
        {hint && <span className="text-dim/50 normal-case tracking-normal">· {hint}</span>}
      </span>
      {children}
    </label>
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
  return (
    <Field label={label} hint={hint}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border-line bg-surface/50 font-mono text-sm text-foreground placeholder:text-dim/50 focus:border-teal/40"
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
  return (
    <Field label={label} hint={hint}>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="resize-none border-line bg-surface/50 font-mono text-sm text-foreground placeholder:text-dim/50 focus:border-teal/40"
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
  return (
    <Field label={label} hint={hint}>
      <Input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="border-line bg-surface/50 font-mono text-sm text-foreground focus:border-teal/40"
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
  return (
    <Field label={label} hint={hint}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-line bg-surface/50 px-3 py-2 font-mono text-sm text-foreground focus:border-teal/40 focus:outline-none"
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
  const add = () => {
    const v = input.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setInput("");
  };
  return (
    <Field label={label} hint={hint}>
      <div className="rounded-md border border-line bg-surface/50 p-2 focus-within:border-teal/40">
        <div className="flex flex-wrap gap-1.5">
          {values.map((v, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded border border-teal/30 bg-teal/10 px-1.5 py-0.5 font-mono text-[10px] text-teal"
            >
              {v}
              <button
                type="button"
                onClick={() => onChange(values.filter((_, j) => j !== i))}
                className="text-teal/60 hover:text-teal"
                aria-label={`Remove ${v}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            }
            if (e.key === "Backspace" && !input && values.length) {
              onChange(values.slice(0, -1));
            }
          }}
          onBlur={add}
          placeholder={values.length ? "" : placeholder}
          className="mt-1 w-full bg-transparent font-mono text-xs text-foreground placeholder:text-dim/50 focus:outline-none"
        />
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
  // Track which item is expanded by a stable id (not array index, which shifts
  // on delete/reorder and causes the "deletes the wrong item" bug).
  const [openId, setOpenId] = React.useState<string | null>(null);

  // Assign a stable id to each item on first render; persist across re-renders.
  const idsRef = React.useRef<string[]>([]);
  if (idsRef.current.length !== items.length) {
    // grow / shrink the id array to match items
    const next = items.map((_, i) => idsRef.current[i] ?? `item-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`);
    idsRef.current = next;
  }

  const idOf = (i: number) => idsRef.current[i];

  const update = (i: number, patch: Partial<T>) => {
    onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));
  };
  const remove = (i: number) => {
    const id = idOf(i);
    onChange(items.filter((_, j) => j !== i));
    idsRef.current = idsRef.current.filter((_, j) => j !== i);
    if (openId === id) setOpenId(null);
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    // swap ids too so the open panel follows the moved item
    [idsRef.current[i], idsRef.current[j]] = [idsRef.current[j], idsRef.current[i]];
  };
  const add = () => {
    const newId = `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    idsRef.current = [...idsRef.current, newId];
    onChange([...items, makeNew()]);
    setOpenId(newId);
  };

  // stop wrapper so clicks on action buttons don't bubble to the toggle row
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const id = idOf(i);
        const isOpen = openId === id;
        return (
          <div
            key={id}
            className={cn(
              "overflow-hidden rounded-xl border bg-surface/30 transition-colors",
              isOpen ? "border-teal/30" : "border-line"
            )}
          >
            <div className="flex items-center gap-2 px-3 py-2">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : id)}
                className="flex flex-1 items-center gap-2 text-left"
              >
                <GripVertical className="h-3.5 w-3.5 shrink-0 text-dim/50" />
                <span className="truncate font-mono text-xs font-medium text-foreground/90">
                  {itemLabel(item, i)}
                </span>
              </button>
              <div className="flex items-center gap-0.5" onClick={stop}>
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
              <div className="space-y-3 border-t border-line p-3">
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
    <div className="rounded-xl border border-line bg-surface/20 p-4">
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
