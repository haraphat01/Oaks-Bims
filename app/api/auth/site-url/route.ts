import { NextResponse } from "next/server";
import { getPublicSiteUrl } from "@/lib/auth/public-site-url";

/**
 * Public origin for auth redirects — derived from trusted proxy headers and env.
 * Used by browser-side Supabase calls so `emailRedirectTo` matches production
 * while requests to Supabase still originate from the visitor (better rate limits).
 */
export async function GET(req: Request) {
  const site = getPublicSiteUrl(req);
  return NextResponse.json(
    { site },
    {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    }
  );
}
