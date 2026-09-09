import { FieldChrome } from "@/components/field/field-chrome";
import { JobSettings } from "@/components/field/job-settings";
import { getActiveFieldJob } from "@/lib/field/job";

export default async function FieldLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { job } = await getActiveFieldJob();

  return <FieldChrome headerAction={<JobSettings job={job} />}>{children}</FieldChrome>;
}
