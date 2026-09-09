import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DailyLogForm } from "@/components/field/daily-log-form";
import { FieldPersistBanner } from "@/components/field/persist-banner";
import { formatFieldLong, isValidISODate } from "@/lib/field/dates";
import { getActiveFieldJob } from "@/lib/field/job";
import { getFieldReportByDate, listFieldReports } from "@/lib/suite/store";

type LogPageProps = {
  params: Promise<{ date: string }>;
};

export async function generateMetadata({ params }: LogPageProps): Promise<Metadata> {
  const { date } = await params;
  return {
    title: isValidISODate(date) ? `Log · ${formatFieldLong(date)}` : "Daily log",
  };
}

export default async function FieldLogPage({ params }: LogPageProps) {
  const { date } = await params;
  if (!isValidISODate(date)) {
    notFound();
  }

  const [{ job, persist: jobPersist }, log, logsResult] = await Promise.all([
    getActiveFieldJob(),
    getFieldReportByDate(date),
    listFieldReports(),
  ]);

  return (
    <>
      <FieldPersistBanner persist={jobPersist === "memory" || logsResult.persist === "memory" ? "memory" : "supabase"} />
      <DailyLogForm date={date} job={job} log={log} />
    </>
  );
}
