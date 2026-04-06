import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "TU_URL_DE_SUPABASE";
const supabaseAnonKey = "TU_LLAVE_ANON_DE_SUPABASE";

// ESTO EVITA EL ERROR DE "MULTIPLE INSTANCES"
// Si ya existe una instancia, la reutiliza. Si no, la crea.
export const supabase =
  globalThis.supabaseInstance || createClient(supabaseUrl, supabaseAnonKey);

if (!globalThis.supabaseInstance) {
  globalThis.supabaseInstance = supabase;
}
