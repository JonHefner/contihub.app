"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
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

export type CrudColumn<T> = {
  key: string;
  label: string;
  className?: string;
  render?: (row: T) => ReactNode;
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
  columns: CrudColumn<T>[];
  rows: T[];
  defaults: Record<string, string>;
  toFormValues: (row: T) => Record<string, string>;
  createAction: (formData: FormData) => Promise<void>;
  updateAction: (id: string, formData: FormData) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
};

const inputClass =
  "w-full rounded-sm border border-steel-200 bg-white px-3 py-2.5 text-navy-900 outline-none ring-gold/30 transition focus:border-navy-800 focus:ring-4";

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
  toFormValues,
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
    setValues({ ...defaults, ...toFormValues(row) });
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
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-steel-500">{eyebrow}</p>
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-navy-900">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-steel-600">{description}</p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="shrink-0 rounded-sm bg-navy-900 px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-navy-800"
        >
          {addLabel}
        </button>
      </div>

      {persist === "memory" ? (
        <p className="mt-5 rounded-sm border border-gold/40 bg-gold-soft/40 px-3 py-2 text-sm text-navy-800">
          Using an in-session store because the Supabase suite tables are not available yet. Apply{" "}
          <code className="font-mono text-xs">supabase/migrations/20260909060000_conti_suite.sql</code>{" "}
          to persist records per user.
        </p>
      ) : null}

      {open ? (
        <form
          onSubmit={onSubmit}
          className="mt-6 rounded-sm border border-navy-900/10 bg-white p-5 shadow-[0_1px_0_rgba(12,27,42,0.04)]"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold text-navy-900">{heading}</h2>
            <button
              type="button"
              onClick={resetForm}
              className="text-sm font-medium text-steel-500 hover:text-navy-900"
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
                <span className="text-sm font-medium text-navy-800">{field.label}</span>
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
            <p className="mt-4 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          ) : null}
          <div className="mt-5 flex justify-end">
            <button
              type="submit"
              disabled={pending}
              className="rounded-sm bg-navy-900 px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-navy-800 disabled:opacity-70"
            >
              {pending ? "Saving…" : editing ? "Save changes" : "Save record"}
            </button>
          </div>
        </form>
      ) : null}

      {rows.length === 0 ? (
        <div className="mt-8 rounded-sm border border-dashed border-navy-900/20 bg-white px-6 py-14 text-center">
          <p className="font-display text-2xl text-navy-900">{emptyTitle}</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-steel-600">{emptyBody}</p>
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-sm border border-navy-900/10 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-navy-900 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
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
                <tr key={row.id} className="border-t border-steel-100 align-top">
                  {columns.map((column) => (
                    <td key={column.key} className={`px-4 py-3 text-navy-900 ${column.className ?? ""}`}>
                      {column.render
                        ? column.render(row)
                        : String((row as Record<string, unknown>)[column.key] ?? "—")}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => startEdit(row)}
                      className="text-sm font-semibold text-navy-800 underline-offset-4 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(row.id)}
                      className="ml-3 text-sm font-semibold text-steel-500 underline-offset-4 hover:text-red-800 hover:underline"
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
