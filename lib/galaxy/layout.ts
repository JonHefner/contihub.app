/** Suite-app placement for the post-login `/app` front page only. Nodes link into the existing suite pages, which do not use this canvas. Pure layout — no framework imports. */

export type GalaxyKind = "hub" | "suite" | "project" | "team";

export type GalaxyCluster = "All" | "Jobs" | "Field" | "Bid" | "Cost" | "People";

export type GalaxyNode = {
  id: string;
  name: string;
  kind: GalaxyKind;
  cluster: Exclude<GalaxyCluster, "All">;
  href: string;
  description: string;
  x: number;
  y: number;
  radius: number;
};

export const GALAXY_CLUSTERS: GalaxyCluster[] = ["All", "Jobs", "Field", "Bid", "Cost", "People"];

export const GALAXY_ROUTES = [
  "/app",
  "/app/projects",
  "/app/field",
  "/app/rfi",
  "/app/bid",
  "/app/bid/directory",
  "/app/cost",
  "/app/change-orders",
  "/app/crm",
  "/app/safety",
  "/app/trak",
] as const;

const HIT_SLOP = 10;

function place(angleDeg: number, orbit: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: Math.round(Math.cos(rad) * orbit),
    y: Math.round(Math.sin(rad) * orbit),
  };
}

function node(
  partial: Omit<GalaxyNode, "x" | "y"> & { angle: number; orbit: number },
): GalaxyNode {
  const { angle, orbit, ...rest } = partial;
  return { ...rest, ...place(angle, orbit) };
}

export function galaxyNodes(): GalaxyNode[] {
  return [
    {
      id: "hub",
      name: "ContiHub",
      kind: "hub",
      cluster: "Jobs",
      href: "/app",
      description: "Conti Way home. Pick a suite app on an orbit, or open the list view for boards, invites, and SAMPLE.",
      x: 0,
      y: 0,
      radius: 58,
    },
    node({
      id: "projects",
      name: "Projects",
      kind: "project",
      cluster: "Jobs",
      href: "/app/projects",
      description: "Jobs and project homes. Field, ContiReview, CRM, Cost, Change Orders, Safety, TraK, and Bid stay scoped to one job.",
      angle: -90,
      orbit: 220,
      radius: 30,
    }),
    node({
      id: "trak",
      name: "ContiTraK",
      kind: "suite",
      cluster: "Jobs",
      href: "/app/trak",
      description: "Milestones, not a CPM schedule.",
      angle: 312,
      orbit: 268,
      radius: 26,
    }),
    node({
      id: "field",
      name: "ContiField",
      kind: "suite",
      cluster: "Field",
      href: "/app/field",
      description: "Superintendent daily logs, photos, and field RFIs.",
      angle: 200,
      orbit: 230,
      radius: 28,
    }),
    node({
      id: "rfi",
      name: "ContiReview",
      kind: "suite",
      cluster: "Field",
      href: "/app/rfi",
      description: "Suggested outcomes, route to the architect or owner, then the ContiHub RFI log.",
      angle: 228,
      orbit: 360,
      radius: 26,
    }),
    node({
      id: "safety",
      name: "ContiSafety",
      kind: "suite",
      cluster: "Field",
      href: "/app/safety",
      description: "Incidents: what happened, who was involved, and the action.",
      angle: 246,
      orbit: 348,
      radius: 26,
    }),
    node({
      id: "bid",
      name: "Conti Bid",
      kind: "suite",
      cluster: "Bid",
      href: "/app/bid",
      description: "Bid packages, magic-link invites, and the chase list. Building Connected stays a checklist.",
      angle: 18,
      orbit: 232,
      radius: 28,
    }),
    node({
      id: "directory",
      name: "Directory",
      kind: "suite",
      cluster: "Bid",
      href: "/app/bid/directory",
      description: "Contractor directory. Search, add, edit, and CSV import.",
      angle: -12,
      orbit: 368,
      radius: 24,
    }),
    node({
      id: "cost",
      name: "ContiCost",
      kind: "suite",
      cluster: "Cost",
      href: "/app/cost",
      description: "Budgets and job cost lines with a rollup.",
      angle: 72,
      orbit: 236,
      radius: 28,
    }),
    node({
      id: "change-orders",
      name: "Change Orders",
      kind: "suite",
      cluster: "Cost",
      href: "/app/change-orders",
      description: "Proposed, pricing, and approved change orders.",
      angle: 102,
      orbit: 368,
      radius: 24,
    }),
    node({
      id: "crm",
      name: "ContiCRM",
      kind: "suite",
      cluster: "People",
      href: "/app/crm",
      description: "Lead, Chase, Interview, and Award.",
      angle: 146,
      orbit: 250,
      radius: 28,
    }),
    node({
      id: "invite",
      name: "Invite teammate",
      kind: "team",
      cluster: "People",
      href: "",
      description: "Staff magic link so teammates share company projects.",
      angle: 168,
      orbit: 392,
      radius: 26,
    }),
  ];
}

export function filterGalaxyNodes(nodes: GalaxyNode[], query: string, cluster: GalaxyCluster): GalaxyNode[] {
  const q = query.trim().toLowerCase();
  return nodes.filter((item) => {
    if (item.kind === "hub") return true;
    if (cluster !== "All" && item.cluster !== cluster) return false;
    if (!q) return true;
    return `${item.name} ${item.id} ${item.cluster}`.toLowerCase().includes(q);
  });
}

export function hitTest(nodes: GalaxyNode[], x: number, y: number): GalaxyNode | null {
  let best: GalaxyNode | null = null;
  for (const item of nodes) {
    const distance = Math.hypot(x - item.x, y - item.y);
    if (distance > item.radius + HIT_SLOP) continue;
    if (!best || item.radius < best.radius) best = item;
  }
  return best;
}
