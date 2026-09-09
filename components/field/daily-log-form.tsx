"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { GroundPicks, WeatherPicks } from "@/components/field/weather-picks";
import { formatFieldLong } from "@/lib/field/dates";
import { DEFAULT_SHIFT } from "@/lib/field/constants";
import type { FieldJob, FieldReport } from "@/lib/suite/types";
import { removeLog, saveLog } from "@/app/app/field/actions";

const fieldClass =
  "flex h-11 w-full rounded-md bg-field-surface-2 px-3 text-base text-field-ink field-shadow outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-primary";

const areaClass =
  "w-full rounded-md bg-field-surface-2 px-3 py-2.5 text-base text-field-ink field-shadow outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-field-primary";

function emptyLog(date: string, job: FieldJob): Omit<FieldReport, "id"> {
  return {
    date,
    jobName: job.jobTitle || job.companyName,
    weather: "Clear",
    weatherPm: "Clear",
    tempLow: "",
    tempHigh: "",
    precip: "",
    wind: "",
    ground: "Dry",
    notes: "",
    crewCount: 0,
    manHours: 0,
    workPerformed: "",
    delays: "",
    materials: "",
    visitors: "",
    preparedBy: "",
    preparedTitle: "",
    shiftStart: DEFAULT_SHIFT.start,
    shiftEnd: DEFAULT_SHIFT.end,
    status: "draft",
  };
}

function Section({
  number,
  title,
  hint,
  children,
}: {
  number: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-field-surface p-4 field-shadow sm:p-5">
      <header className="mb-4 flex items-baseline gap-3 border-b border-field-line pb-3">
        <span className="font-display text-xl font-semibold tabular-nums tracking-wide text-field-faint">
          {number}
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-xl font-semibold tracking-[0.04em] text-field-ink uppercase">
            {title}
          </h2>
          {hint ? <p className="mt-0.5 text-sm text-field-muted">{hint}</p> : null}
        </div>
      </header>
      {children}
    </section>
  );
}

export function DailyLogForm({
  date,
  job,
  log,
}: {
  date: string;
  job: FieldJob;
  log: FieldReport | null;
}) {
  const router = useRouter();
  const initial = log ?? { id: "", ...emptyLog(date, job) };
  const [weather, setWeather] = useState(initial.weather || "Clear");
  const [weatherPm, setWeatherPm] = useState(initial.weatherPm || "Clear");
  const [ground, setGround] = useState(initial.ground || "Dry");
  const [finalized, setFinalized] = useState(initial.status === "final");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    startTransition(async () => {
      try {
        await saveLog(formData);
        router.refresh();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Unable to save this log.");
      }
    });
  }

  function onDelete() {
    if (!log || !window.confirm("Delete this daily log?")) {
      return;
    }
    startTransition(async () => {
      try {
        await removeLog(log.id);
        router.push("/app/field");
        router.refresh();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Unable to delete this log.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="no-print flex items-center justify-between gap-3">
        <Link href="/app/field" className="text-sm font-medium text-field-primary">
          Back to daily logs
        </Link>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="h-9 rounded-md bg-field-surface-2 px-3 text-sm font-medium text-field-ink field-shadow"
          >
            Print
          </button>
          {log ? (
            <button
              type="button"
              onClick={onDelete}
              className="h-9 rounded-md px-3 text-sm font-medium text-field-danger"
            >
              Delete
            </button>
          ) : null}
        </div>
      </div>

      <article className="rounded-2xl bg-field-primary px-4 py-5 text-field-primary-fg field-shadow">
        <p className="text-[0.7rem] font-semibold tracking-[0.14em] uppercase opacity-80">
          {job.companyName || "Continental Construction of Ohio"}
        </p>
        <h1 className="mt-1 font-display text-[1.75rem] leading-none font-semibold tracking-wide">
          DAILY CONSTRUCTION LOG
        </h1>
        <p className="mt-2 text-sm opacity-80">{job.jobTitle || "Job not set"}</p>
        <p className="mt-1 text-sm opacity-80">
          {job.jobNumber ? `Job ${job.jobNumber}` : "No job #"} · {formatFieldLong(date)}
        </p>
        <p className="mt-3 text-[0.7rem] font-semibold uppercase tracking-[0.14em] opacity-70">
          Status · {finalized ? "Final" : "Draft"}
        </p>
      </article>

      <input type="hidden" name="id" value={log?.id ?? ""} />
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="jobName" value={job.jobTitle || job.companyName} />

      <Section number="01" title="Report header">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex min-w-0 flex-col gap-1.5">
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-field-muted">
              Prepared by
            </span>
            <input name="preparedBy" defaultValue={initial.preparedBy} className={fieldClass} />
          </label>
          <label className="flex min-w-0 flex-col gap-1.5">
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-field-muted">
              Title
            </span>
            <input name="preparedTitle" defaultValue={initial.preparedTitle} className={fieldClass} />
          </label>
          <label className="flex min-w-0 flex-col gap-1.5">
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-field-muted">
              Shift start
            </span>
            <input
              type="time"
              name="shiftStart"
              defaultValue={initial.shiftStart || DEFAULT_SHIFT.start}
              className={fieldClass}
            />
          </label>
          <label className="flex min-w-0 flex-col gap-1.5">
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-field-muted">
              Shift end
            </span>
            <input
              type="time"
              name="shiftEnd"
              defaultValue={initial.shiftEnd || DEFAULT_SHIFT.end}
              className={fieldClass}
            />
          </label>
        </div>
      </Section>

      <Section number="02" title="Weather" hint="Record AM and PM. Delays go in section 05.">
        <div className="grid gap-4">
          <WeatherPicks name="weather" label="Morning" value={weather} onChange={setWeather} />
          <WeatherPicks name="weatherPm" label="Afternoon" value={weatherPm} onChange={setWeatherPm} />
          <div className="grid gap-3 sm:grid-cols-4">
            <label className="flex min-w-0 flex-col gap-1.5">
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-field-muted">
                Low °F
              </span>
              <input name="tempLow" defaultValue={initial.tempLow} className={fieldClass} />
            </label>
            <label className="flex min-w-0 flex-col gap-1.5">
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-field-muted">
                High °F
              </span>
              <input name="tempHigh" defaultValue={initial.tempHigh} className={fieldClass} />
            </label>
            <label className="flex min-w-0 flex-col gap-1.5">
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-field-muted">
                Precip (in)
              </span>
              <input name="precip" defaultValue={initial.precip} className={fieldClass} />
            </label>
            <label className="flex min-w-0 flex-col gap-1.5">
              <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-field-muted">
                Wind (mph)
              </span>
              <input name="wind" defaultValue={initial.wind} className={fieldClass} />
            </label>
          </div>
          <GroundPicks value={ground} onChange={setGround} />
        </div>
      </Section>

      <Section number="03" title="Manpower" hint="On-site count and man-hours for the day.">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex min-w-0 flex-col gap-1.5">
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-field-muted">
              On-site count
            </span>
            <input
              type="number"
              name="crewCount"
              min={0}
              max={500}
              step="1"
              defaultValue={initial.crewCount}
              className={fieldClass}
            />
          </label>
          <label className="flex min-w-0 flex-col gap-1.5">
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-field-muted">
              Man-hours
            </span>
            <input
              type="number"
              name="manHours"
              min={0}
              max={10000}
              step="0.5"
              defaultValue={initial.manHours}
              className={fieldClass}
            />
          </label>
        </div>
      </Section>

      <Section number="04" title="Work performed">
        <textarea
          name="workPerformed"
          rows={4}
          defaultValue={initial.workPerformed}
          placeholder="Locations, activities, and percent complete"
          className={areaClass}
        />
      </Section>

      <Section number="05" title="Delays">
        <textarea
          name="delays"
          rows={3}
          defaultValue={initial.delays}
          placeholder="Weather, material, access, or trade delays"
          className={areaClass}
        />
      </Section>

      <Section number="06" title="Materials received">
        <textarea
          name="materials"
          rows={3}
          defaultValue={initial.materials}
          placeholder="Item, quantity, vendor, ticket"
          className={areaClass}
        />
      </Section>

      <Section number="07" title="Visitors & inspections">
        <textarea
          name="visitors"
          rows={3}
          defaultValue={initial.visitors}
          placeholder="Name, company, purpose"
          className={areaClass}
        />
      </Section>

      <Section number="08" title="Notes">
        <textarea
          name="notes"
          rows={3}
          defaultValue={initial.notes}
          placeholder="Remarks, extra work, change directives"
          className={areaClass}
        />
      </Section>

      <label className="flex items-center gap-3 rounded-2xl bg-field-surface px-4 py-4 field-shadow">
        <input
          type="checkbox"
          name="markFinal"
          value="1"
          checked={finalized}
          onChange={(event) => setFinalized(event.target.checked)}
          className="size-4 accent-field-primary"
        />
        <span>
          <span className="block font-semibold text-field-ink">Mark report final</span>
          <span className="text-sm text-field-muted">
            I certify this report is a true account of work, labor, and conditions on this date.
          </span>
        </span>
      </label>

      {error ? <p className="text-sm text-field-danger">{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="no-print h-12 rounded-md bg-field-primary text-sm font-semibold text-field-primary-fg disabled:opacity-70"
      >
        {pending ? "Saving…" : log ? "Save log" : "Start and save log"}
      </button>
    </form>
  );
}
