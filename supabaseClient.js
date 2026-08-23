import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

// SUPABASE_URL / SUPABASE_ANON_KEY are set as `window.__SUPABASE_CONFIG__` by
// a small inline <script> in index.html / admin.html / consulta.html, so this
// same client file works on every page without a build step or .env loader.
//
// IMPORTANT: only the public anon key ever goes here. The service role key
// must never be shipped to the frontend — see README.md.
const config = window.__SUPABASE_CONFIG__ || {};

if (!config.url || !config.anonKey) {
  // Fails loud in the console instead of silently breaking every Supabase
  // call — much easier to debug on a phone than a blank screen.
  console.error(
    "[supabaseClient] Missing window.__SUPABASE_CONFIG__.url / anonKey. " +
      "Set them in the <script> block at the top of this page's HTML file."
  );
}

export const supabase = createClient(config.url || "", config.anonKey || "", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
