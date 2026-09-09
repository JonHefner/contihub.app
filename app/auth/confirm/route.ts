import { type NextRequest } from "next/server";
import { handleAuthCallback } from "@/lib/supabase/complete-auth";

export async function GET(request: NextRequest) {
  return handleAuthCallback(request);
}
