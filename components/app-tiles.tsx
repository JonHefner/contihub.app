import Link from "next/link";
import { contiApps } from "@/lib/apps";

export function AppTiles() {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {contiApps.map((app) => (
        <li key={app.id}>
          <Link href={app.href} className="group block transition hover:-translate-y-0.5">
            <img
              src={`/brand/tiles/${app.id}.png`}
              alt={app.name}
              width={512}
              height={512}
              className="aspect-square w-full rounded-[1.6rem] object-contain shadow-[0_16px_32px_-18px_rgba(0,0,0,0.75)]"
            />
            <p className="mt-3 px-1 text-sm leading-6 text-muted">{app.description}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
