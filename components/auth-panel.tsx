import Link from "next/link";

type AuthPanelProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AuthPanel({
  eyebrow = "ContiHub access",
  title,
  description,
  children,
}: AuthPanelProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-page">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(30,79,163,0.28),transparent_42%),radial-gradient(circle_at_80%_100%,rgba(201,163,74,0.1),transparent_32%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <Link href="/" className="flex flex-col items-center text-center">
          <img
            src="/brand/cc-mark-on-dark.png"
            alt="Conti nested CC mark"
            width={96}
            height={96}
            className="h-24 w-24 rounded-[1.2rem] shadow-[0_16px_32px_-18px_rgba(0,0,0,0.75)]"
          />
          <span className="mt-5 font-display text-[1.85rem] font-semibold tracking-tight text-ink">
            ContiHub
          </span>
          <span className="mt-2 block h-0.5 w-20 rounded-full bg-gold" />
          <span className="mt-2 text-[10px] font-medium uppercase tracking-[0.22em] text-muted">
            The Conti Way
          </span>
        </Link>
        <div className="mt-10 rounded-2xl border border-gold/35 bg-surface p-8 shadow-[0_0_0_1px_rgba(201,163,74,0.08),0_16px_40px_-24px_rgba(0,0,0,0.8)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">{eyebrow}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink-strong">{title}</h1>
          <p className="mt-2 text-sm text-muted">{description}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
