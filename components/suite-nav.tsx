"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { suiteNav } from "@/lib/apps";

export function SuiteNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Conti suite" className="no-print border-b border-white/8 bg-charcoal">
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
        {suiteNav.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 rounded-sm px-3 py-2 text-sm font-semibold tracking-wide transition ${
                active
                  ? "bg-royal text-gold"
                  : "text-muted hover:bg-surface-2 hover:text-ink"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
