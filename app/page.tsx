import Link from "next/link";
import { AppTiles } from "@/components/app-tiles";
import { Logo } from "@/components/logo";

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
      <header className="border-b border-white/8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Logo light />
          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/login"
              className="rounded-sm px-3 py-2 font-medium text-muted transition hover:text-ink"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-sm bg-gold px-3.5 py-2 font-semibold text-page transition hover:bg-gold-soft"
            >
              Request access
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,79,163,0.28),transparent_38%),linear-gradient(120deg,rgba(201,163,74,0.12),transparent_42%)]" />
          <div className="relative mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:py-28">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">
                The Conti Way · Akron, Ohio
              </p>
              <h1 className="mt-5 font-display text-4xl leading-[1.1] font-semibold tracking-tight text-ink-strong sm:text-6xl">
                Operations for Continental Construction of Ohio.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
                ContiHub is the live ops portal for CCO. Sign in to reach the Conti suite —
                estimating, field, CRM, safety, tracking, and bid — from one secure home on{" "}
                <span className="text-ink">contihub.app</span>.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="rounded-sm bg-gold px-5 py-2.5 text-sm font-semibold text-page transition hover:bg-gold-soft"
                >
                  Sign in to ContiHub
                </Link>
                <Link
                  href="#suite"
                  className="rounded-sm border border-gold/35 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-gold"
                >
                  View the suite
                </Link>
              </div>
            </div>
            <aside className="self-end rounded-2xl border border-gold/25 bg-surface/80 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
                Continental Construction
              </p>
              <p className="mt-3 font-display text-2xl text-ink-strong">
                Focus. Dedication. Execution.
              </p>
              <p className="mt-3 text-sm leading-6 text-muted">
                A local alternative to large corporate construction management — accountable
                leadership, creative problem solving, and projects our customers are proud of.
              </p>
            </aside>
          </div>
        </section>

        <section className="border-y border-white/8 bg-charcoal">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 py-16 md:grid-cols-3">
            {pillars.map((pillar) => (
              <article key={pillar.title} className="border-t-2 border-gold pt-5">
                <h2 className="font-display text-2xl font-semibold text-ink-strong">{pillar.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted">{pillar.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="suite" className="bg-page">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Conti suite</p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-ink-strong">
              Built for how CCO works.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              The full Conti suite is live behind the same sign-in. Open any app to start working.
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
