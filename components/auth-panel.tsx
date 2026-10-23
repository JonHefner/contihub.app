import Link from "next/link";
import { PublicHeader } from "@/components/public-header";

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
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(30,79,163,0.3),transparent_42%),radial-gradient(circle_at_80%_100%,rgba(201,163,74,0.1),transparent_32%)]" />
      <div className="relative">
        <PublicHeader />
        <div className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <Link href="/" className="inline-block h-40 w-40 shrink-0 overflow-hidden sm:h-56 sm:w-56">
              <img
                src="/brand/conti-way-mark.png"
                alt="Conti Way mark"
                width={224}
                height={224}
                className="h-[130%] w-full max-w-none object-cover object-top"
              />
            </Link>
            <div className="w-full max-w-md rounded-2xl border border-gold/35 bg-surface p-8 shadow-[0_0_0_1px_rgba(201,163,74,0.08),0_16px_40px_-24px_rgba(0,0,0,0.8)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">{eyebrow}</p>
              <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink-strong sm:text-6xl">
                {title}
              </h1>
              <p className="mt-4 max-w-xl text-lg leading-8 text-muted">{description}</p>
              <div className="mt-6">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
