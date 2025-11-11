import { createClient } from "@supabase/supabase-js";

// Denne klient bruges kun på serversiden
export const supabaseServer = createClient(
  process.env.SUPABASE_URL ?? "",
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
);
