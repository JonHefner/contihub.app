"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CcMark } from "@/components/cc-mark";
import { ClipboardListIcon, FileQuestionIcon } from "@/components/field/icons";

export function FieldChrome({
  children,
  headerAction,
  fieldBase,
}: {
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  fieldBase: string;
}) {
  const pathname = usePathname();
  const tabs = [
    { href: fieldBase, label: "Daily logs", match: "logs" as const },
    { href: `${fieldBase}/rfis`, label: "RFIs", match: "rfis" as const },
  ];

  return (
    <div className="field-app min-h-[calc(100vh-8.5rem)]">
      <div className="mx-auto flex w-full max-w-3xl flex-col px-4 pt-4 pb-24">
        <header className="no-print flex items-start justify-between gap-3 py-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-field-primary field-shadow">
              <CcMark id="contifield-header" size={40} />
            </span>
            <div className="leading-none">
              <p className="font-display text-lg leading-none font-semibold tracking-wide text-field-ink sm:text-xl">
                DAILY CONSTRUCTION LOG
              </p>
              <p className="mt-0.5 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-field-muted">
                ContiField · Superintendent field report
              </p>
            </div>
          </div>
          {headerAction}
        </header>
        {children}
      </div>
      <nav className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-field-line bg-field-bg/95 pt-1 pb-[max(0.4rem,env(safe-area-inset-bottom))] backdrop-blur-sm">
        <div className="mx-auto grid max-w-3xl grid-cols-2">
          {tabs.map((tab) => {
            const Icon = tab.match === "logs" ? ClipboardListIcon : FileQuestionIcon;
            const active =
              tab.match === "logs"
                ? pathname === fieldBase || pathname.startsWith(`${fieldBase}/log`)
                : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex h-12 flex-col items-center justify-center gap-0.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] ${
                  active ? "text-field-primary" : "text-field-muted"
                }`}
              >
                <Icon className="size-5" />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
