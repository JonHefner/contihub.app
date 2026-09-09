export type ContiApp = {
  id: string;
  name: string;
  description: string;
  status: "live" | "coming-soon";
  href?: string;
};

export const contiApps: ContiApp[] = [
  {
    id: "contihub",
    name: "ContiHub",
    description: "Ops portal and home for the Conti suite.",
    status: "live",
    href: "/app",
  },
  {
    id: "conticost",
    name: "ContiCost",
    description: "Estimating, budgets, and job cost control.",
    status: "coming-soon",
  },
  {
    id: "contifield",
    name: "ContiField",
    description: "Daily reports, photos, and field coordination.",
    status: "coming-soon",
  },
  {
    id: "conticrm",
    name: "ContiCRM",
    description: "Owners, architects, and opportunity tracking.",
    status: "coming-soon",
  },
  {
    id: "contisafety",
    name: "ContiSafety",
    description: "Incidents, toolbox talks, and compliance.",
    status: "coming-soon",
  },
  {
    id: "contitrak",
    name: "ContiTraK",
    description: "Schedule, production, and project tracking.",
    status: "coming-soon",
  },
  {
    id: "contibid",
    name: "Conti Bid",
    description: "Bid invitations, takeoff, and proposal workflow.",
    status: "coming-soon",
  },
];
