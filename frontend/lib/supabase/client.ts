import { createBrowserClient } from "@supabase/ssr";


// ============================================================
// SUPABASE BROWSER CLIENT
// ============================================================
//
// This client is used by the Next.js browser application.
//
// Supabase manages the authenticated session and access token.
// The API client (`lib/api.ts`) reads that session and sends
// the access token to the FastAPI backend.
//
// ============================================================

export function createClient() {

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}