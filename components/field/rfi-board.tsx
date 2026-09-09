"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { ChevronRightIcon, FilePlusIcon } from "@/components/field/icons";
import { formatFieldDue, todayISO } from "@/lib/field/dates";
import { isRfiOverdue, nextRfiNumber, rfiChip } from "@/lib/field/stats";
import { removeRfi, saveRfi } from "@/app/app/field/actions";
import type { FieldRfi } from "@/lib/suite/types";

const fieldClass =
  "flex h-11 w-full rounded-md bg-field-surface-2 px-3 text-base text-field-ink field-shadow outline-none focus-visible:outline-2 focus-visible:outline-field-primary";

export function RfiBoard({
  rfis,
  initialOpen = false,
  editingId = "",
  fieldBase,
  projectId,
}: {
  rfis: FieldRfi[];
  initialOpen?: boolean;
  editingId?: string;
  fieldBase: string;
  projectId: string;
}) {
  const router = useRouter();
  const editing = useMemo(
    () => rfis.find((rfi) => rfi.id === editingId) ?? null,
    [editingId, rfis],
  );
  const [open, setOpen] = useState(initialOpen || Boolean(editing));
  const [current, setCurrent] = useState<FieldRfi | null>(editing);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const suggestedNumber = nextRfiNumber(rfis);

  function startCreate() {
    setCurrent(null);
    setError(null);
    setOpen(true);
  }

  function startEdit(rfi: FieldRfi) {
    setCurrent(rfi);
    setError(null);
    setOpen(true);
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    startTransition(async () => {
      try {
        await saveRfi(formData);
        setOpen(false);
        setCurrent(null);
        router.replace(`${fieldBase}/rfis`);
        router.refresh();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Unable to save RFI.");
      }
    });
  }

  function onDelete(id: string) {
    if (!window.confirm("Delete this RFI?")) {
      return;
    }
    startTransition(async () => {
      try {
        await removeRfi(id);
        if (current?.id === id) {
          setOpen(false);
          setCurrent(null);
        }
        router.refresh();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Unable to delete RFI.");
      }
    });
  }

  return (
    <div>
      {rfis.length === 0 && !open ? (
        <p className="rounded-2xl bg-field-surface px-4 py-5 text-sm text-field-muted field-shadow">
          No RFIs yet. Log the first question from the job.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rfis.map((rfi) => {
            const overdue = isRfiOverdue(rfi);
            return (
              <li key={rfi.id}>
                <button
                  type="button"
                  onClick={() => startEdit(rfi)}
                  className="flex w-full items-center gap-3 rounded-xl bg-field-surface px-3 py-3 text-left field-shadow"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-field-chip font-display text-sm font-semibold text-field-primary">
                    {rfiChip(rfi.number)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-field-ink">{rfi.number}</p>
                      <span className="inline-flex items-center rounded-full bg-field-primary px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-field-primary-fg">
                        {rfi.status}
                      </span>
                      {overdue ? (
                        <span className="inline-flex items-center rounded-full bg-field-danger/12 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-field-danger">
                          Overdue
                        </span>
                      ) : null}
                    </div>
                    <p className="truncate text-sm text-field-muted">
                      {rfi.title || rfi.description || "No title"}
                      {rfi.dueDate ? ` · due ${formatFieldDue(rfi.dueDate)}` : ""}
                    </p>
                  </div>
                  <ChevronRightIcon className="size-4 shrink-0 text-field-faint" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={startCreate}
        className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-field-surface-2 text-sm font-medium text-field-ink field-shadow"
      >
        <FilePlusIcon className="size-4" />
        New RFI
      </button>

      {open ? (
        <form onSubmit={onSubmit} className="mt-4 rounded-2xl bg-field-surface p-4 field-shadow">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold uppercase tracking-wide text-field-ink">
              {current ? "Edit RFI" : "New RFI"}
            </h2>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setCurrent(null);
              }}
              className="text-sm font-medium text-field-muted"
            >
              Cancel
            </button>
          </div>
          <input type="hidden" name="id" value={current?.id ?? ""} />
          <input type="hidden" name="projectId" value={projectId} />
          <div className="grid gap-3">
            <label className="grid gap-1.5">
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-field-muted">
                Number
              </span>
              <input
                name="number"
                required
                defaultValue={current?.number ?? suggestedNumber}
                className={fieldClass}
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-field-muted">
                Title
              </span>
              <input name="title" required defaultValue={current?.title ?? ""} className={fieldClass} />
            </label>
            <label className="grid gap-1.5">
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-field-muted">
                Description
              </span>
              <textarea
                name="description"
                rows={3}
                defaultValue={current?.description ?? ""}
                className="w-full rounded-md bg-field-surface-2 px-3 py-2.5 text-field-ink field-shadow outline-none focus-visible:outline-2 focus-visible:outline-field-primary"
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-field-muted">
                Due date
              </span>
              <input
                type="date"
                name="dueDate"
                required
                defaultValue={current?.dueDate || todayISO()}
                className={fieldClass}
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-field-muted">
                Status
              </span>
              <select name="status" defaultValue={current?.status ?? "open"} className={fieldClass}>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </label>
          </div>
          {error ? <p className="mt-3 text-sm text-field-danger">{error}</p> : null}
          <div className="mt-4 flex items-center justify-between gap-3">
            {current ? (
              <button
                type="button"
                onClick={() => onDelete(current.id)}
                className="text-sm font-semibold text-field-danger"
              >
                Delete
              </button>
            ) : (
              <span />
            )}
            <button
              type="submit"
              disabled={pending}
              className="h-11 rounded-md bg-field-primary px-4 text-sm font-semibold text-field-primary-fg disabled:opacity-70"
            >
              {pending ? "Saving…" : "Save RFI"}
            </button>
          </div>
        </form>
      ) : null}

      <p className="mt-4 text-center">
        <Link href={fieldBase} className="text-sm font-medium text-field-primary">
          Back to daily logs
        </Link>
      </p>
    </div>
  );
}
