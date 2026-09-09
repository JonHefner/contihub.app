export type ContiApp = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  status: "live";
  href: string;
};

export const contiApps: ContiApp[] = [
  {
    id: "contihub",
    name: "ContiHub",
    shortName: "Hub",
    description: "Ops portal and home for the Conti suite.",
    status: "live",
    href: "/app",
  },
  {
    id: "projects",
    name: "Projects",
    shortName: "Projects",
    description: "Jobs and project homes. Field, CRM, Cost, Safety, TraK, and Bid stay scoped to one job.",
    status: "live",
    href: "/app/projects",
  },
  {
    id: "conticrm",
    name: "ContiCRM",
    shortName: "CRM",
    description: "Owners, architects, and opportunity tracking.",
    status: "live",
    href: "/app/crm",
  },
  {
    id: "contifield",
    name: "ContiField",
    shortName: "Field",
    description: "Superintendent daily construction logs and RFIs.",
    status: "live",
    href: "/app/field",
  },
  {
    id: "conticost",
    name: "ContiCost",
    shortName: "Cost",
    description: "Estimating, budgets, and job cost control.",
    status: "live",
    href: "/app/cost",
  },
  {
    id: "contisafety",
    name: "ContiSafety",
    shortName: "Safety",
    description: "Incidents, toolbox talks, and compliance.",
    status: "live",
    href: "/app/safety",
  },
  {
    id: "contitrak",
    name: "ContiTraK",
    shortName: "TraK",
    description: "Schedule, production, and project tracking.",
    status: "live",
    href: "/app/trak",
  },
  {
    id: "contibid",
    name: "Conti Bid",
    shortName: "Bid",
    description: "Bid invitations, takeoff, and proposal workflow.",
    status: "live",
    href: "/app/bid",
  },
];

export const suiteNav = contiApps.map((app) => ({
  name: app.shortName,
  href: app.href,
  exact: app.href === "/app",
}));
