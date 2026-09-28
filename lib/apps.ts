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
    description: "Jobs and project homes. Field, ContiReview, CRM, Cost, Change Orders, Safety, TraK, and Bid stay scoped to one job.",
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
    description: "Milestone look-ahead list. Not a CPM schedule.",
    status: "live",
    href: "/app/trak",
  },
  {
    id: "contibid",
    name: "Conti Bid",
    shortName: "Bid",
    description: "Contractor directory, bid packages, and chase list. Takeoff stays outside Hub.",
    status: "live",
    href: "/app/bid",
  },
];

/** Front-page reel. Same tile art as the suite, plus ContiReview and Change Orders. */
export const hubTiles: ContiApp[] = [
  ...contiApps,
  {
    id: "contireview",
    name: "ContiReview",
    shortName: "ContiReview",
    description: "Suggested outcomes, route to the architect or owner, then the ContiHub RFI log.",
    status: "live",
    href: "/app/rfi",
  },
  {
    id: "changeorders",
    name: "Change Orders",
    shortName: "COs",
    description: "Proposed, pricing, and approved change orders.",
    status: "live",
    href: "/app/change-orders",
  },
];

export const suiteNav = [
  ...contiApps.map((app) => ({
    name: app.shortName,
    href: app.href,
    exact: app.href === "/app",
  })),
  { name: "ContiReview", href: "/app/rfi", exact: false },
  { name: "COs", href: "/app/change-orders", exact: false },
];
