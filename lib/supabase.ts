import { createClient } from "@supabase/supabase-js";

function value(...names: string[]) {
  for (const name of names) {
    const current = process.env[name]?.trim();
    if (current) return current;
  }
  return "";
}

export function createSupabaseAdmin() {
  const url = value("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL");
  const key = value("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY");
  if (!url || !key) throw new Error("Supabase nu este configurat complet.");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
