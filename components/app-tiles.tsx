import Link from "next/link";
import { contiApps } from "@/lib/apps";

export function AppTiles() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {contiApps.map((app) => (
        <li key={app.id}>
          <Link
            href={app.href}
            className="group block rounded-2xl transition hover:-translate-y-0.5"
          >
            <img
              src={`/brand/tiles/${app.id}.svg`}
              alt={app.name}
              className="w-full rounded-2xl shadow-[0_12px_28px_-16px_rgba(0,0,0,0.65)]"
            />
            <p className="mt-3 px-1 text-sm leading-6 text-muted">{app.description}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
