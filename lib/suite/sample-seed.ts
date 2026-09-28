import { SAMPLE_CONTRACTORS, SAMPLE_DRAWINGS_URL, SAMPLE_PACKAGE_TITLE, SAMPLE_PROJECT_NAME } from "@/lib/bid/sample-contractors";
import { contractorName } from "@/lib/bid/csv";
import { todayISO } from "@/lib/suite/form";
import { importContractors, listInvitees, listPackages, saveInvitee, savePackage } from "@/lib/suite/bid-store";
import {
  listCostJobs,
  listCrmLeads,
  listFieldReports,
  listFieldRfis,
  listProjects,
  listSafetyLogs,
  listTrakMilestones,
  saveCostJob,
  saveCrmLead,
  saveFieldReport,
  saveFieldRfi,
  saveProject,
  saveSafetyLog,
  saveTrakMilestone,
} from "@/lib/suite/store";

function shiftDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return todayISO(date);
}

export async function seedSampleWorkspace() {
  const projects = await listProjects();
  let project = projects.rows.find((row) => row.name === SAMPLE_PROJECT_NAME);
  if (!project) {
    project = await saveProject({
      name: SAMPLE_PROJECT_NAME,
      jobNumber: "DC-SAMPLE",
      address: "SAMPLE — site address withheld",
      status: "Bidding",
    });
  }

  const projectId = project.id;
  await importContractors(SAMPLE_CONTRACTORS);

  const reports = await listFieldReports(projectId);
  const reportDays = [
    { offset: -2, status: "final" as const, work: "SAMPLE — Mass excavation of the north yard and haul-off." },
    { offset: -1, status: "final" as const, work: "SAMPLE — Underslab plumbing and vapor barrier at data hall A." },
    { offset: 0, status: "draft" as const, work: "SAMPLE — Form and pour equipment pads. Electrical rough-in continues." },
  ];
  for (const day of reportDays) {
    const date = shiftDate(day.offset);
    if (reports.rows.some((row) => row.date === date)) {
      continue;
    }
    await saveFieldReport({
      projectId,
      date,
      jobName: SAMPLE_PROJECT_NAME,
      weather: "Clear",
      weatherPm: "Cloudy",
      tempLow: "48",
      tempHigh: "67",
      precip: "0",
      wind: "8",
      ground: "Dry",
      notes: "SAMPLE daily log",
      crewCount: 18 + day.offset,
      manHours: 140,
      workPerformed: day.work,
      delays: day.offset === 0 ? "SAMPLE — Waiting on switchgear shop drawing." : "",
      materials: "SAMPLE — Stone and vapor barrier",
      visitors: "SAMPLE — Owner's rep walk",
      preparedBy: "SAMPLE Super",
      preparedTitle: "Superintendent",
      shiftStart: "07:00",
      shiftEnd: "15:30",
      status: day.status,
    });
  }

  const rfis = await listFieldRfis(projectId);
  const sampleRfis = [
    ["RFI-S01", "SAMPLE — Electrical gear clearance", "Confirm working clearance at the main switchgear.", "open", 5],
    ["RFI-S02", "SAMPLE — Roof screen steel", "Confirm embed locations for the screen steel.", "open", 12],
    ["RFI-S03", "SAMPLE — Fire pump room drain", "Closed sample. Floor drain relocated.", "closed", -3],
  ] as const;
  for (const [number, title, description, status, dueOffset] of sampleRfis) {
    if (rfis.rows.some((row) => row.number === number)) {
      continue;
    }
    await saveFieldRfi({
      projectId,
      number,
      title,
      description,
      status,
      dueDate: shiftDate(dueOffset),
    });
  }

  const leads = await listCrmLeads(projectId);
  if (!leads.rows.some((row) => row.notes.includes("SAMPLE"))) {
    const rows = [
      ["Avery Holt", "Northline Owners", "Lead", "Call the intro meeting", 0],
      ["Priya Shah", "Studio North Architects", "Chase", "Send qualifications", 12500000],
      ["Chris Adelman", "Data Hall Owner", "Interview", "Site walk with the short list", 42000000],
      ["SAMPLE Award", "Data Hall Owner", "Award", "Kick off precon", 42000000],
      ["SAMPLE Method", "Continental Construction", "Method", "Assign the project team", 42000000],
    ] as const;
    for (const [name, company, stage, nextAction, value] of rows) {
      await saveCrmLead({
        projectId,
        name,
        company,
        stage,
        nextAction,
        value,
        notes: "SAMPLE Conti chase",
      });
    }
  }

  const costs = await listCostJobs(projectId);
  if (!costs.rows.some((row) => row.job.startsWith("SAMPLE"))) {
    const lines = [
      ["SAMPLE A10 Foundations", 2400000, 1800000, 900000],
      ["SAMPLE B20 Exterior enclosure", 6100000, 4200000, 1100000],
      ["SAMPLE D30 HVAC", 8900000, 2100000, 400000],
      ["SAMPLE D50 Electrical", 7600000, 1500000, 250000],
    ] as const;
    for (const [job, budget, committed, actual] of lines) {
      await saveCostJob({ projectId, job, budget, committed, actual });
    }
  }

  const safety = await listSafetyLogs(projectId);
  if (!safety.rows.some((row) => row.location.includes("SAMPLE"))) {
    await saveSafetyLog({
      projectId,
      type: "Incident",
      date: shiftDate(-1),
      location: "SAMPLE — data hall A",
      notes: "SAMPLE incident log",
      whatHappened: "SAMPLE — Worker slipped on wet vapor barrier. No lost time.",
      whoInvolved: "SAMPLE — carpentry foreman",
      correctiveAction: "SAMPLE — Dry the area and review housekeeping at the next toolbox talk.",
      attendeeCount: 0,
    });
    await saveSafetyLog({
      projectId,
      type: "Toolbox Talk",
      date: shiftDate(0),
      location: "SAMPLE — job trailer",
      notes: "SAMPLE — Housekeeping and wet surfaces",
      whatHappened: "",
      whoInvolved: "",
      correctiveAction: "",
      attendeeCount: 16,
    });
  }

  const milestones = await listTrakMilestones(projectId);
  if (!milestones.rows.some((row) => row.activity.startsWith("SAMPLE"))) {
    const rows = [
      ["SAMPLE — Sitework", -10, 20, 40, "In progress", "SAMPLE Super"],
      ["SAMPLE — Foundations", -2, 30, 15, "In progress", "SAMPLE PM"],
      ["SAMPLE — Electrical gear", 14, 60, 0, "Not started", "SAMPLE Estimator"],
    ] as const;
    for (const [activity, start, finish, percentComplete, status, owner] of rows) {
      await saveTrakMilestone({
        projectId,
        activity,
        start: shiftDate(start),
        finish: shiftDate(finish),
        percentComplete,
        status,
        owner,
      });
    }
  }

  const packages = await listPackages(projectId);
  let pkg = packages.rows.find((row) => row.title === SAMPLE_PACKAGE_TITLE);
  let packagePersist = packages.persist;
  if (!pkg) {
    const saved = await savePackage({
      projectId,
      projectName: project.name,
      title: SAMPLE_PACKAGE_TITLE,
      dueAt: `${shiftDate(14)}T15:00:00`,
      drawingsTeamsUrl: SAMPLE_DRAWINGS_URL,
      notes: "SAMPLE invite log only. No email was sent. Replace the Teams link with the live drawings channel. Building Connected stays a parallel send.",
      buildingConnectedSent: false,
    });
    pkg = saved.row;
    packagePersist = saved.persist;
  }

  const invitees = await listInvitees(pkg.id);
  if (invitees.rows.length === 0) {
    for (const contractor of SAMPLE_CONTRACTORS.slice(0, 3)) {
      await saveInvitee(
        {
          packageId: pkg.id,
          contractorId: "",
          userId: "",
          email: contractor.email,
          name: contractorName(contractor.firstName, contractor.lastName, contractor.company),
          company: contractor.company,
          trade: "Earthwork and concrete",
          status: "invited",
          invitedAt: new Date().toISOString(),
          magicLinkSentAt: "",
        },
        undefined,
        packagePersist,
      );
    }
  }

  return { projectId };
}
