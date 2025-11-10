import { createClient } from "@supabase/supabase-js";
import { ENV } from "./env.server";

export const supaAdmin = createClient(
  ENV.SUPABASE_URL,
  ENV.SUPABASE_SERVICE_ROLE,
  { auth: { persistSession: false } }
);
