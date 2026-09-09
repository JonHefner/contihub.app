import Link from "next/link";
import { DatePickerLink } from "@/components/field/date-picker-link";
import { CalendarPlusIcon, ChevronRightIcon, CloudRainIcon, FilePlusIcon, SunIcon } from "@/components/field/icons";
import { FieldPersistBanner } from "@/components/field/persist-banner";
import { fieldJobFromProject } from "@/lib/field/job";
import { formatFieldLong, formatFieldShort, todayISO, weekdayLong } from "@/lib/field/dates";
import { isRfiOverdue, openRfiCount, rfiChip, weatherSummary, weekManHours } from "@/lib/field/stats";
import { fieldBase } from "@/lib/projects";
import type { PersistMode, Project } from "@/lib/suite/types";
import { listFieldReports, listFieldRfis } from "@/lib/suite/store";

export async function FieldHome({
  project,
  persist,
}: {
  project: Project;
  persist: PersistMode;
}) {
  const today = todayISO();
  const base = fieldBase(project.id);
  const job = fieldJobFromProject(project);
  const [logsResult, rfisResult] = await Promise.all([
    listFieldReports(project.id),
    listFieldRfis(project.id),
  ]);
  const todayLog = logsResult.rows.find((log) => log.date === today) ?? null;
  const archive = logsResult.rows.filter((log) => log.date !== today);
  const manHours = weekManHours(logsResult.rows, today);
  const openRfis = openRfiCount(rfisResult.rows);
  const combinedPersist =
    persist === "memory" || logsResult.persist === "memory" || rfisResult.persist === "memory"
      ? "memory"
      : "supabase";

  return (
    <>
      <FieldPersistBanner persist={combinedPersist} />

      <div className="rounded-2xl bg-field-primary px-4 py-5 text-field-primary-fg field-shadow">
        <p className="text-[0.7rem] font-semibold tracking-[0.14em] uppercase opacity-80">
          {job.companyName}
        </p>
        <h1 className="mt-1 font-display text-[1.75rem] leading-none font-semibold tracking-wide">
          {job.jobTitle}
        </h1>
        <p className="mt-2 text-sm opacity-80">
          {job.jobNumber ? `Job ${job.jobNumber}` : "No job #"}
          {job.address ? ` · ${job.address}` : ""}
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-field-primary-fg/15 pt-4 text-sm">
          <div>
            <dt className="text-[0.65rem] tracking-[0.14em] uppercase opacity-70">7-day man-hours</dt>
            <dd className="font-display text-2xl font-semibold tabular-nums">{manHours}</dd>
          </div>
          <div>
            <dt className="text-[0.65rem] tracking-[0.14em] uppercase opacity-70">Open RFIs</dt>
            <dd className="font-display text-2xl font-semibold tabular-nums">{openRfis}</dd>
          </div>
        </dl>
      </div>

      <section className="mt-5">
        <div className="mb-2 flex items-end justify-between">
          <h2 className="font-display text-lg font-semibold tracking-[0.08em] text-field-ink uppercase">
            Today
          </h2>
          <span className="text-sm text-field-muted">{formatFieldLong(today)}</span>
        </div>
        <div className="rounded-2xl bg-field-surface p-4 field-shadow">
          {todayLog ? (
            <>
              <div className="flex items-center gap-2">
                <p className="font-medium text-field-ink">
                  {todayLog.status === "final" ? "Final report on file" : "Draft started"}
                </p>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${
                    todayLog.status === "final"
                      ? "bg-field-ok/12 text-field-ok"
                      : "bg-field-warn/12 text-field-warn"
                  }`}
                >
                  {todayLog.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-field-muted">
                {weatherSummary(todayLog)} · {todayLog.crewCount} on site
              </p>
              <Link
                href={`${base}/log/${today}`}
                className="mt-3 flex h-11 w-full items-center justify-center rounded-md bg-field-primary text-sm font-medium text-field-primary-fg"
              >
                Continue today&apos;s log
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-field-muted">No report started for {weekdayLong(today)}.</p>
              <Link
                href={`${base}/log/${today}`}
                className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-field-primary text-sm font-medium text-field-primary-fg"
              >
                <CalendarPlusIcon className="size-4" />
                Start today&apos;s log
              </Link>
            </>
          )}
        </div>
        <DatePickerLink defaultDate={today} fieldBase={base} />
      </section>

      <section className="mt-6">
        <div className="mb-2 flex items-end justify-between">
          <h2 className="font-display text-lg font-semibold tracking-[0.08em] text-field-ink uppercase">
            RFIs
          </h2>
          <Link href={`${base}/rfis`} className="text-sm font-medium text-field-primary">
            Full log
          </Link>
        </div>
        {rfisResult.rows.length === 0 ? (
          <p className="rounded-2xl bg-field-surface px-4 py-5 text-sm text-field-muted field-shadow">
            No RFIs on this job.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {rfisResult.rows.slice(0, 5).map((rfi) => (
              <li key={rfi.id}>
                <Link
                  href={`${base}/rfis?id=${rfi.id}`}
                  className="flex items-center gap-3 rounded-xl bg-field-surface px-3 py-3 field-shadow"
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
                      {isRfiOverdue(rfi, today) ? (
                        <span className="inline-flex items-center rounded-full bg-field-danger/12 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-field-danger">
                          Overdue
                        </span>
                      ) : null}
                    </div>
                    <p className="truncate text-sm text-field-muted">{rfi.title}</p>
                  </div>
                  <ChevronRightIcon className="size-4 shrink-0 text-field-faint" />
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link
          href={`${base}/rfis?new=1`}
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-field-surface-2 text-sm font-medium text-field-ink field-shadow"
        >
          <FilePlusIcon className="size-4" />
          New RFI
        </Link>
      </section>

      <section className="mt-6">
        <h2 className="mb-2 font-display text-lg font-semibold tracking-[0.08em] text-field-ink uppercase">
          Archive
        </h2>
        {archive.length === 0 ? (
          <p className="rounded-2xl bg-field-surface px-4 py-5 text-sm text-field-muted field-shadow">
            Past daily logs will land here.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {archive.map((log) => {
              const wet = /rain|snow|overcast|fog/i.test(`${log.weather} ${log.weatherPm}`);
              return (
                <li key={log.id}>
                  <Link
                    href={`${base}/log/${log.date}`}
                    className="flex items-center gap-3 rounded-xl bg-field-surface px-3 py-3 field-shadow"
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-field-chip text-field-primary">
                      {wet ? <CloudRainIcon className="size-5" /> : <SunIcon className="size-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-field-ink">{formatFieldShort(log.date)}</p>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${
                            log.status === "final"
                              ? "bg-field-ok/12 text-field-ok"
                              : "bg-field-warn/12 text-field-warn"
                          }`}
                        >
                          {log.status}
                        </span>
                      </div>
                      <p className="truncate text-sm text-field-muted">
                        {weatherSummary(log)} · {log.crewCount} on site
                      </p>
                    </div>
                    <ChevronRightIcon className="size-4 shrink-0 text-field-faint" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
