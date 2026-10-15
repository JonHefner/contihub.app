import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

export const requireUser = cache(async function requireUser() {
  if (!getSupabaseUrl() || !getSupabaseAnonKey()) {
    redirect("/login?next=/app");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/app");
  }

  return { supabase, user };
});
