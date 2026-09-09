import { signOut } from "@/app/actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="rounded-sm border border-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-steel-200 transition hover:border-gold/50 hover:text-paper"
      >
        Sign out
      </button>
    </form>
  );
}
