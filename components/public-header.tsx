import Link from "next/link";
import { Logo } from "@/components/logo";

export function PublicHeader() {
  return (
    <header className="border-b border-white/8 bg-page/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Logo light size="lg" />
        <nav className="flex items-center gap-2 text-sm sm:gap-3">
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
  );
}
