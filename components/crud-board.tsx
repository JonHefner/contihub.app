"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDate, formatMoneyExact } from "@/lib/suite/form";
import type { PersistMode } from "@/lib/suite/types";

export type FieldType = "text" | "textarea" | "number" | "date" | "select";

export type CrudField = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  min?: number;
  max?: number;
  step?: string;
  placeholder?: string;
};

export type ColumnFormat = "text" | "emphasis" | "badge" | "date" | "money" | "variance" | "percent";

export type CrudColumn = {
  key: string;
  label: string;
  className?: string;
  format?: ColumnFormat;
};

type CrudBoardProps<T extends { id: string }> = {
  eyebrow: string;
  title: string;
  description: string;
  addLabel: string;
  editLabel?: string;
  emptyTitle: string;
  emptyBody: string;
  persist: PersistMode;
  fields: CrudField[];
  columns: CrudColumn[];
  rows: T[];
  defaults: Record<string, string>;
  hiddenValues?: Record<string, string>;
  createAction: (formData: FormData) => Promise<void>;
  updateAction: (id: string, formData: FormData) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
};

const inputClass =
  "w-full rounded-sm border border-line bg-surface-2 px-3 py-2.5 text-ink outline-none ring-gold/25 transition focus:border-gold focus:ring-4";

function asRecord(row: { id: string }): Record<string, unknown> {
  return row as Record<string, unknown>;
}

function rowToFormValues(
  row: { id: string },
  fields: CrudField[],
  defaults: Record<string, string>,
): Record<string, string> {
  const source = asRecord(row);
  const values = { ...defaults };

  for (const field of fields) {
    const value = source[field.name];
    if (value !== undefined && value !== null) {
      values[field.name] = String(value);
    }
  }

  return values;
}

function cellText(row: Record<string, unknown>, key: string) {
  const value = row[key];
  if (value === undefined || value === null || value === "") {
    return "—";
  }
  return String(value);
}

function asNumber(value: unknown) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

function ColumnCell({ column, row }: { column: CrudColumn; row: Record<string, unknown> }) {
  const format = column.format ?? "text";
  const raw = row[column.key];

  if (format === "emphasis") {
    return <span className="font-semibold">{cellText(row, column.key)}</span>;
  }

  if (format === "badge") {
    return (
      <span className="rounded-sm bg-royal-deep px-2 py-1 text-xs font-semibold uppercase tracking-wide text-gold-soft">
        {cellText(row, column.key)}
      </span>
    );
  }

  if (format === "date") {
    return <>{formatDate(typeof raw === "string" ? raw : "")}</>;
  }

  if (format === "money") {
    return <>{formatMoneyExact(asNumber(raw))}</>;
  }

  if (format === "variance") {
    const variance = asNumber(row.budget) - asNumber(row.actual);
    const over = variance < 0;
    return (
      <span className={over ? "font-semibold text-red-800" : "font-semibold text-emerald-800"}>
        {over ? "−" : "+"}
        {formatMoneyExact(Math.abs(variance))}
      </span>
    );
  }

  if (format === "percent") {
    const pct = Math.min(100, Math.max(0, asNumber(raw)));
    return (
      <div className="min-w-32">
        <div className="flex items-center justify-between text-xs font-semibold text-ink">
          <span>{pct}%</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-sm bg-surface-2">
          <div className="h-full bg-gold" style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }

  return <>{cellText(row, column.key)}</>;
}

export function CrudBoard<T extends { id: string }>({
  eyebrow,
  title,
  description,
  addLabel,
  editLabel = "Edit record",
  emptyTitle,
  emptyBody,
  persist,
  fields,
  columns,
  rows,
  defaults,
  hiddenValues = {},
  createAction,
  updateAction,
  deleteAction,
}: CrudBoardProps<T>) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>(defaults);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const editing = Boolean(editingId);

  const heading = useMemo(
    () => (editing ? editLabel : addLabel),
    [addLabel, editLabel, editing],
  );

  function resetForm() {
    setValues(defaults);
    setEditingId(null);
    setOpen(false);
    setError(null);
  }

  function startCreate() {
    setValues(defaults);
    setEditingId(null);
    setError(null);
    setOpen(true);
  }

  function startEdit(row: T) {
    setValues(rowToFormValues(row, fields, defaults));
    setEditingId(row.id);
    setError(null);
    setOpen(true);
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);

    startTransition(async () => {
      try {
        if (editingId) {
          await updateAction(editingId, formData);
        } else {
          await createAction(formData);
        }
        resetForm();
        router.refresh();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Unable to save.");
      }
    });
  }

  function onDelete(id: string) {
    if (!window.confirm("Delete this record?")) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteAction(id);
        if (editingId === id) {
          resetForm();
        }
        router.refresh();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Unable to delete.");
      }
    });
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">{eyebrow}</p>
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-ink-strong">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{description}</p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="shrink-0 rounded-sm bg-gold px-4 py-2.5 text-sm font-semibold text-page transition hover:bg-gold-soft"
        >
          {addLabel}
        </button>
      </div>

      {persist === "memory" ? (
        <p className="mt-5 rounded-sm border border-gold/35 bg-gold/10 px-3 py-2 text-sm text-gold-soft">
          Using an in-session store because the Supabase suite tables are not available yet. Apply the
          SQL files in <code className="font-mono text-xs">supabase/migrations/</code> to persist
          records per user.
        </p>
      ) : null}

      {open ? (
        <form
          onSubmit={onSubmit}
          className="mt-6 rounded-sm border border-line bg-surface p-5"
        >
          {Object.entries(hiddenValues).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold text-ink-strong">{heading}</h2>
            <button
              type="button"
              onClick={resetForm}
              className="text-sm font-medium text-muted hover:text-ink"
            >
              Cancel
            </button>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {fields.map((field) => (
              <label
                key={field.name}
                className={`space-y-2 ${field.type === "textarea" ? "md:col-span-2" : ""}`}
              >
                <span className="text-sm font-medium text-ink">{field.label}</span>
                {field.type === "textarea" ? (
                  <textarea
                    name={field.name}
                    required={field.required}
                    rows={3}
                    placeholder={field.placeholder}
                    value={values[field.name] ?? ""}
                    onChange={(event) =>
                      setValues((current) => ({ ...current, [field.name]: event.target.value }))
                    }
                    className={inputClass}
                  />
                ) : field.type === "select" ? (
                  <select
                    name={field.name}
                    required={field.required}
                    value={values[field.name] ?? field.options?.[0] ?? ""}
                    onChange={(event) =>
                      setValues((current) => ({ ...current, [field.name]: event.target.value }))
                    }
                    className={inputClass}
                  >
                    {(field.options ?? []).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    name={field.name}
                    type={field.type}
                    required={field.required}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    placeholder={field.placeholder}
                    value={values[field.name] ?? ""}
                    onChange={(event) =>
                      setValues((current) => ({ ...current, [field.name]: event.target.value }))
                    }
                    className={inputClass}
                  />
                )}
              </label>
            ))}
          </div>
          {error ? (
            <p className="mt-4 rounded-sm border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}
          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={pending}
              className="rounded-sm bg-gold px-4 py-2.5 text-sm font-semibold text-page transition hover:bg-gold-soft disabled:opacity-70"
            >
              {pending ? "Saving…" : editing ? "Save changes" : "Save record"}
            </button>
          </div>
        </form>
      ) : null}

      {rows.length === 0 ? (
        <div className="mt-8 rounded-sm border border-dashed border-line bg-surface px-6 py-14 text-center">
          <p className="font-display text-2xl text-ink-strong">{emptyTitle}</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{emptyBody}</p>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-sm border border-line bg-surface">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-charcoal text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className={`px-4 py-3 ${column.className ?? ""}`}>
                    {column.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-line align-top">
                  {columns.map((column) => (
                    <td key={column.key} className={`px-4 py-3 text-ink ${column.className ?? ""}`}>
                      <ColumnCell column={column} row={asRecord(row)} />
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => startEdit(row)}
                      className="text-sm font-semibold text-gold underline-offset-4 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(row.id)}
                      className="ml-3 text-sm font-semibold text-muted underline-offset-4 hover:text-red-300 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
