import Link from "next/link";
import { AppTiles } from "@/components/app-tiles";
import { PublicHeader } from "@/components/public-header";

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
          <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 py-16 text-center lg:py-24">
            <img
              src="/brand/tiles/contihub.png"
              alt="ContiHub — nested blue and gold CC mark"
              width={320}
              height={320}
              className="aspect-square h-52 w-52 rounded-[2rem] object-contain shadow-[0_24px_48px_-20px_rgba(0,0,0,0.85)] sm:h-64 sm:w-64"
            />
            <h1 className="mt-8 text-5xl font-semibold tracking-tight text-ink-strong sm:text-7xl">
              ContiHub
            </h1>
            <span className="mt-5 block h-px w-28 bg-gradient-to-r from-transparent via-gold to-transparent" />
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.32em] text-gold">
              The Conti Way
            </p>
            <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
              The ops portal for Continental Construction of Ohio. Sign in to Projects, Field, Cost,
              CRM, Safety, TraK, and Bid.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
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

        <section id="suite" className="bg-page">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Conti suite</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink-strong">
              Built for how CCO works.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              Every app uses the same Conti mark. Open any tile after sign-in.
            </p>
            <div className="mt-10">
              <AppTiles />
            </div>
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
