import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Email-confirmation / password-reset callback.
 * Supabase redirects here with ?code=… after verifying the token.
 *
 * Behind a reverse proxy (Coolify, nginx, etc.) req.url resolves to the
 * container's internal address (http://localhost:3000), so we must use
 * NEXT_PUBLIC_SITE_URL as the base for the final redirect — never url.origin.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/account";

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://oaksandbims.com";
  return NextResponse.redirect(new URL(next, base));
}
