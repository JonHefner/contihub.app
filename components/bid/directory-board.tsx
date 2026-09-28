"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SampleBadge } from "@/components/sample-badge";
import type { BidContractor, PersistMode } from "@/lib/suite/types";
import { importDirectoryCsv, removeContractor, saveDirectoryContractor } from "@/app/app/bid/directory/actions";

const inputClass =
  "w-full rounded-sm border border-line bg-surface-2 px-3 py-2.5 text-sm text-ink outline-none ring-gold/25 focus:border-gold focus:ring-4";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  company: "",
  phone: "",
  office: "",
  cell: "",
  street: "",
  city: "",
  state: "",
  zip: "",
  categories: "",
  notes: "",
};

export function DirectoryBoard({ rows, persist }: { rows: BidContractor[]; persist: PersistMode }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return rows;
    }
    return rows.filter((row) =>
      [row.name, row.email, row.company, row.categories, row.city, row.notes].join(" ").toLowerCase().includes(needle),
    );
  }, [query, rows]);

  function edit(row: BidContractor) {
    setEditing(row.id);
    setForm({
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      company: row.company,
      phone: row.phone,
      office: row.office,
      cell: row.cell,
      street: row.street,
      city: row.city,
      state: row.state,
      zip: row.zip,
      categories: row.categories,
      notes: row.notes,
    });
  }

  return (
    <div className="mt-8">
      {persist === "memory" ? (
        <p className="mb-4 rounded-sm border border-gold/35 bg-gold/10 px-3 py-2 text-sm text-gold-soft">
          Directory is in-session until <code className="font-mono text-xs">20260927120000_full_court_press.sql</code> is applied.
        </p>
      ) : null}
      <p className="max-w-3xl text-sm leading-6 text-muted">
        Search the Conti bidder list here. Live Outlook GAL sync needs Microsoft Graph org-directory scopes Conti does not have in the app yet. Import a GAL export or the Conti bidder CSV. Building Connected is not connected to this list.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, company, email, trade"
          className={`${inputClass} sm:max-w-md`}
        />
        <div className="flex flex-wrap gap-2">
          <a href="/app/bid/directory/export" className="rounded-sm border border-gold/40 px-3 py-2 text-sm font-semibold text-gold">
            Export CSV
          </a>
          <label className="rounded-sm bg-gold px-3 py-2 text-sm font-semibold text-page">
            Import CSV
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file) {
                  return;
                }
                setMessage(null);
                startTransition(async () => {
                  try {
                    const text = await file.text();
                    const result = await importDirectoryCsv(text);
                    setMessage(`Imported ${result.created} new and updated ${result.updated}.`);
                    router.refresh();
                  } catch (caught) {
                    setMessage(caught instanceof Error ? caught.message : "Import failed.");
                  }
                });
              }}
            />
          </label>
        </div>
      </div>
      {message ? <p className="mt-3 text-sm text-gold-soft">{message}</p> : null}

      <form
        className="mt-6 grid gap-3 rounded-2xl border border-gold/25 bg-charcoal p-4 md:grid-cols-3"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setMessage(null);
          startTransition(async () => {
            try {
              await saveDirectoryContractor(data, editing ?? undefined);
              setEditing(null);
              setForm(emptyForm);
              setMessage(editing ? "Contractor updated." : "Contractor added.");
              router.refresh();
            } catch (caught) {
              setMessage(caught instanceof Error ? caught.message : "Could not save contractor.");
            }
          });
        }}
      >
        {(
          [
            ["firstName", "First"],
            ["lastName", "Last"],
            ["email", "Email"],
            ["company", "Company"],
            ["phone", "Phone"],
            ["office", "Office"],
            ["cell", "Cell"],
            ["street", "Street"],
            ["city", "City"],
            ["state", "State"],
            ["zip", "Zip"],
          ] as const
        ).map(([name, label]) => (
          <label key={name} className="text-sm">
            <span className="text-muted">{label}</span>
            <input
              name={name}
              value={form[name]}
              onChange={(event) => setForm({ ...form, [name]: event.target.value })}
              className={`${inputClass} mt-1`}
            />
          </label>
        ))}
        <label className="text-sm md:col-span-3">
          <span className="text-muted">Categories / trades</span>
          <input
            name="categories"
            value={form.categories}
            onChange={(event) => setForm({ ...form, categories: event.target.value })}
            className={`${inputClass} mt-1`}
          />
        </label>
        <label className="text-sm md:col-span-3">
          <span className="text-muted">Notes</span>
          <textarea
            name="notes"
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
            className={`${inputClass} mt-1`}
            rows={2}
          />
        </label>
        <div className="flex gap-2 md:col-span-3">
          <button type="submit" disabled={pending} className="rounded-sm bg-gold px-4 py-2 text-sm font-semibold text-page disabled:opacity-70">
            {editing ? "Save contractor" : "Add contractor"}
          </button>
          {editing ? (
            <button
              type="button"
              className="rounded-sm border border-gold/40 px-4 py-2 text-sm font-semibold text-gold"
              onClick={() => {
                setEditing(null);
                setForm(emptyForm);
              }}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-gold">
            <tr>
              <th className="px-2 py-2">Name</th>
              <th className="px-2 py-2">Company</th>
              <th className="px-2 py-2">Email</th>
              <th className="px-2 py-2">Categories</th>
              <th className="px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-2 py-8 text-muted">
                  No contractors yet. Import the SAMPLE CSV or add one.
                </td>
              </tr>
            ) : (
              visible.map((row) => (
                <tr key={row.id} className="border-t border-white/10">
                  <td className="px-2 py-3">
                    <span className="font-semibold">{row.name}</span> <SampleBadge text={`${row.notes} ${row.name}`} />
                  </td>
                  <td className="px-2 py-3">{row.company}</td>
                  <td className="px-2 py-3">{row.email}</td>
                  <td className="px-2 py-3 text-muted">{row.categories}</td>
                  <td className="px-2 py-3 text-right">
                    <button type="button" className="mr-3 text-gold" onClick={() => edit(row)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-red-300"
                      onClick={() => {
                        if (!window.confirm(`Remove ${row.name}?`)) {
                          return;
                        }
                        startTransition(async () => {
                          await removeContractor(row.id);
                          router.refresh();
                        });
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
