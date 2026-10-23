import Link from "next/link";
import { PublicHeader } from "@/components/public-header";
import { RevolvingTiles } from "@/components/revolving-tiles";
import { hubTiles } from "@/lib/apps";

const pillars = [
  {
    title: "Focus",
    body: "One project owner, one accountable leader. No middlemen between the field and the decision.",
  },
  {
    title: "Dedication",
    body: "Present on the job from kickoff through closeout. Direct access to the people who own the outcome.",
  },
  {
    title: "Execution",
    body: "Creative solutions for schedule, budget, and unforeseen conditions — delivered the Conti Way.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-page text-ink">
      <PublicHeader />

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(30,79,163,0.34),transparent_42%),radial-gradient(circle_at_88%_18%,rgba(201,163,74,0.14),transparent_30%)]" />
          <div className="relative mx-auto max-w-6xl px-6 py-12 lg:py-16">
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
              <span className="inline-block h-40 w-40 shrink-0 overflow-hidden sm:h-56 sm:w-56">
                <img
                  src="/brand/conti-way-mark.png"
                  alt="Conti Way mark"
                  width={224}
                  height={224}
                  className="h-[130%] w-full max-w-none object-cover object-top"
                />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
                  Continental Construction of Ohio
                </p>
                <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink-strong sm:text-6xl">
                  Welcome to ContiHub
                </h1>
                <p className="mt-4 max-w-xl text-lg leading-8 text-muted">
                  The ops portal for Continental Construction of Ohio. Sign in to open a project, then
                  work the Conti suite against that job.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/login"
                    className="rounded-sm bg-gold px-6 py-2.5 text-sm font-semibold text-page transition hover:bg-gold-soft"
                  >
                    Sign in to ContiHub
                  </Link>
                  <Link
                    href="#suite"
                    className="rounded-sm border border-gold/35 px-6 py-2.5 text-sm font-semibold text-ink transition hover:border-gold"
                  >
                    View the suite
                  </Link>
                </div>
              </div>
            </div>
            <div id="suite">
              <RevolvingTiles tiles={hubTiles} />
            </div>
          </div>
        </section>

        <section className="border-y border-white/8 bg-charcoal">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 py-16 md:grid-cols-3">
            {pillars.map((pillar) => (
              <article key={pillar.title} className="border-t-2 border-gold pt-5">
                <h2 className="text-2xl font-semibold tracking-tight text-ink-strong">{pillar.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted">{pillar.body}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>ContiHub · Continental Construction of Ohio, LLC</p>
          <p>123 Wooster Avenue, Akron, Ohio 44307</p>
        </div>
      </footer>
    </div>
  );
}
