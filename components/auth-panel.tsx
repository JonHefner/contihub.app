import { Logo } from "@/components/logo";

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
    <div className="min-h-screen bg-page">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <Logo light href="/" />
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
