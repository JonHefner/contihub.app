import Link from "next/link";
import { CcMark } from "@/components/cc-mark";

type LogoProps = {
  href?: string;
  light?: boolean;
};

export function Logo({ href = "/", light = true }: LogoProps) {
  const mark = (
    <span className="inline-flex items-center gap-3">
      <span
        aria-hidden
        className="grid h-11 w-11 place-items-center rounded-lg border border-gold/45 bg-charcoal shadow-[inset_0_0_0_1px_rgba(201,163,74,0.12)]"
      >
        <CcMark id="header-logo" size={38} />
      </span>
      <span className="leading-none">
        <span
          className={`block font-display text-[1.35rem] font-semibold tracking-tight ${
            light ? "text-ink" : "text-page"
          }`}
        >
          ContiHub
        </span>
        <span
          className={`mt-1 block text-[10px] font-medium uppercase tracking-[0.22em] ${
            light ? "text-muted" : "text-steel-500"
          }`}
        >
          The Conti Way
        </span>
      </span>
    </span>
  );

  if (!href) {
    return mark;
  }

  return (
    <Link href={href} className="inline-flex items-center">
      {mark}
    </Link>
  );
}
