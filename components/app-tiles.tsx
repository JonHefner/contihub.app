import Link from "next/link";
import { contiApps } from "@/lib/apps";

export function AppTiles() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {contiApps.map((app) => (
        <li key={app.id}>
          <Link
            href={app.href}
            className="block h-full rounded-sm border border-navy-900 bg-paper p-5 shadow-[0_1px_0_rgba(12,27,42,0.04)] ring-1 ring-navy-900/5 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-xl font-semibold tracking-tight text-navy-900">
                {app.name}
              </h2>
              <span className="shrink-0 rounded-sm bg-navy-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">
                Live
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-steel-600">{app.description}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
