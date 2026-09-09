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
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(30,79,163,0.32),transparent_36%),radial-gradient(circle_at_88%_8%,rgba(201,163,74,0.16),transparent_28%)]" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
            <div>
              <img
                src="/brand/cc-mark.svg"
                alt="Conti nested CC mark"
                width={128}
                height={128}
                className="h-28 w-28 drop-shadow-[0_12px_24px_rgba(30,79,163,0.35)]"
              />
              <h1 className="mt-6 font-display text-5xl leading-none font-semibold tracking-tight text-ink-strong sm:text-7xl">
                ContiHub
              </h1>
              <span className="mt-5 block h-0.5 w-24 rounded-full bg-gold" />
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.28em] text-gold">
                The Conti Way · Akron, Ohio
              </p>
              <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
                The ops portal for Continental Construction of Ohio. Projects, field logs, cost,
                CRM, safety, tracking, and bid — one dark, secure home on{" "}
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
            <aside className="mx-auto w-full max-w-sm">
              <img
                src="/brand/tiles/contihub.svg"
                alt="ContiHub app tile"
                className="w-full drop-shadow-[0_24px_40px_rgba(0,0,0,0.45)]"
              />
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
              Each tile is the Conti mark: dark matte, nested blue and gold CCs, white wordmark, gold
              underline. Open any app after sign-in.
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
