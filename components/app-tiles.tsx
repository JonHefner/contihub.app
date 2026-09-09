import Link from "next/link";
import { CcMark } from "@/components/cc-mark";
import { contiApps } from "@/lib/apps";

export function AppTiles() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {contiApps.map((app) => (
        <li key={app.id}>
          <Link
            href={app.href}
            className="group relative flex h-full flex-col items-center overflow-hidden rounded-2xl border border-gold/35 bg-charcoal px-5 py-7 text-center shadow-[0_0_0_1px_rgba(12,12,14,0.8),0_12px_28px_-16px_rgba(0,0,0,0.65)] transition hover:-translate-y-0.5 hover:border-gold/60"
          >
            <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(30,79,163,0.22),transparent_46%)]" />
            <span className="relative grid size-[5.5rem] place-items-center">
              <CcMark id={`tile-${app.id}`} size={88} />
            </span>
            <h2 className="relative mt-4 text-lg font-semibold tracking-wide text-ink-strong">
              {app.name}
            </h2>
            <span className="relative mt-2 block h-0.5 w-16 rounded-full bg-gold" />
            <p className="relative mt-3 text-sm leading-6 text-muted">{app.description}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
