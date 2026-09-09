import Link from "next/link";
import { FieldChrome } from "@/components/field/field-chrome";
import { FieldProjectSettings } from "@/components/field/field-project-settings";
import { fieldBase, projectHref } from "@/lib/projects";
import { loadProject } from "@/lib/suite/project-route";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export default async function ProjectFieldLayout({ children, params }: LayoutProps) {
  const { id } = await params;
  const project = await loadProject(id);

  return (
    <FieldChrome
      fieldBase={fieldBase(project.id)}
      headerAction={
        <div className="flex items-center gap-2">
          <Link
            href={projectHref(project.id)}
            className="inline-flex h-11 items-center rounded-md bg-field-surface-2 px-3 text-xs font-semibold uppercase tracking-[0.12em] text-field-ink field-shadow"
          >
            Project
          </Link>
          <FieldProjectSettings project={project} />
        </div>
      }
    >
      {children}
    </FieldChrome>
  );
}
