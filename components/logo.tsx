import Link from "next/link";

type LogoProps = {
  href?: string;
  light?: boolean;
  size?: "sm" | "lg";
};

export function Logo({ href = "/", light = true, size = "sm" }: LogoProps) {
  const markSize = size === "lg" ? "h-16 w-16" : "h-12 w-12";
  const titleSize = size === "lg" ? "text-[1.85rem]" : "text-[1.35rem]";
  const markPx = size === "lg" ? 64 : 48;

  const mark = (
    <span className="inline-flex items-center gap-3">
      <span className={`${markSize} inline-block shrink-0 overflow-hidden`}>
        <img
          src="/brand/conti-way-mark.png"
          alt=""
          width={markPx}
          height={markPx}
          className="h-[150%] w-full max-w-none object-cover object-top"
        />
      </span>
      <span className="leading-none">
        <span
          className={`block font-semibold tracking-tight ${titleSize} ${
            light ? "text-ink" : "text-page"
          }`}
        >
          ContiHub
        </span>
        <span className={`mt-1.5 block h-0.5 rounded-full bg-gold ${size === "lg" ? "w-20" : "w-14"}`} />
        <span
          className={`mt-1.5 block text-[10px] font-medium uppercase tracking-[0.22em] ${
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
