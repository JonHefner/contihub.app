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
        <div className="mx-auto flex max-w-md flex-col items-center px-6 py-12 sm:py-16">
          <Link href="/" className="flex flex-col items-center text-center">
            <img
              src="/brand/tiles/contihub.png"
              alt="ContiHub — nested blue and gold CC mark"
              width={176}
              height={176}
              className="h-40 w-40 rounded-[1.75rem] shadow-[0_20px_40px_-18px_rgba(0,0,0,0.85)]"
            />
            <span className="mt-5 text-xs font-semibold uppercase tracking-[0.28em] text-gold">
              The Conti Way
            </span>
          </Link>
          <div className="mt-8 w-full rounded-2xl border border-gold/35 bg-surface p-8 shadow-[0_0_0_1px_rgba(201,163,74,0.08),0_16px_40px_-24px_rgba(0,0,0,0.8)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">{eyebrow}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink-strong">{title}</h1>
            <p className="mt-2 text-sm text-muted">{description}</p>
            <div className="mt-6">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
