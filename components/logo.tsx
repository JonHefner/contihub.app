import Link from "next/link";

type LogoProps = {
  href?: string;
  light?: boolean;
};

export function Logo({ href = "/", light = false }: LogoProps) {
  const mark = (
    <span className="inline-flex items-center gap-3">
      <span
        aria-hidden
        className={`grid h-9 w-9 place-items-center rounded-sm border text-[15px] font-semibold tracking-tight ${
          light
            ? "border-gold/50 bg-navy-800 text-gold"
            : "border-navy-800 bg-navy-900 text-gold"
        }`}
      >
        C
      </span>
      <span className="leading-none">
        <span
          className={`block font-display text-[1.35rem] font-semibold tracking-tight ${
            light ? "text-paper" : "text-navy-900"
          }`}
        >
          ContiHub
        </span>
        <span
          className={`mt-1 block text-[10px] font-medium uppercase tracking-[0.22em] ${
            light ? "text-steel-300" : "text-steel-500"
          }`}
        >
          Continental Construction
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
