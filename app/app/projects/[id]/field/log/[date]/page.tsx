import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DailyLogForm } from "@/components/field/daily-log-form";
import { FieldPersistBanner } from "@/components/field/persist-banner";
import { fieldJobFromProject } from "@/lib/field/job";
import { formatFieldLong, isValidISODate } from "@/lib/field/dates";
import { fieldBase } from "@/lib/projects";
import { loadProject } from "@/lib/suite/project-route";
import { getFieldReportByDate, listFieldReports } from "@/lib/suite/store";

type LogPageProps = {
  params: Promise<{ id: string; date: string }>;
};

export async function generateMetadata({ params }: LogPageProps): Promise<Metadata> {
  const { date } = await params;
  return {
    title: isValidISODate(date) ? `Log · ${formatFieldLong(date)}` : "Daily log",
  };
}

export default async function ProjectFieldLogPage({ params }: LogPageProps) {
  const { id, date } = await params;
  if (!isValidISODate(date)) {
    notFound();
  }

  const [project, log, logsResult] = await Promise.all([
    loadProject(id),
    getFieldReportByDate(date, id),
    listFieldReports(id),
  ]);

  return (
    <>
      <FieldPersistBanner persist={logsResult.persist} />
      <DailyLogForm
        date={date}
        job={fieldJobFromProject(project)}
        log={log}
        fieldBase={fieldBase(project.id)}
        projectId={project.id}
      />
    </>
  );
}
