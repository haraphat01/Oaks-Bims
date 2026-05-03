import { NextResponse } from "next/server";
import { getPublicSiteUrl } from "@/lib/auth/public-site-url";
import { createClient } from "@/lib/supabase/server";

/**
 * Email-confirmation / password-reset callback.
 * Supabase redirects here with ?code=… after verifying the token.
 *
 * Behind a reverse proxy (Coolify, nginx, etc.) req.url resolves to the
 * container's internal address (http://localhost:3000), so we must not use
 * url.origin — use {@link getPublicSiteUrl}.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/account";

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  const base = getPublicSiteUrl(req);
  return NextResponse.redirect(new URL(next, base));
}
