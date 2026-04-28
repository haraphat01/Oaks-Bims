import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getResend, FROM_EMAIL, savedSearchAlertEmail } from "@/lib/resend";

// Called daily by Vercel Cron (see vercel.json). Protected by CRON_SECRET.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const resend = getResend();

  const { data: searches, error: searchErr } = await supabase
    .from("saved_searches")
    .select("*");

  if (searchErr) {
    return NextResponse.json({ error: searchErr.message }, { status: 500 });
  }

  let notified = 0;

  for (const search of searches ?? []) {
    const since = search.last_notified_at
      ? new Date(search.last_notified_at).toISOString()
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const f = search.filters as Record<string, string>;

    let query = supabase
      .from("properties")
      .select("id, slug, title, city, state, price_ngn, cover_image_url, purpose")
      .eq("status", "available")
      .gt("created_at", since)
      .order("created_at", { ascending: false })
      .limit(5);

    if (f.purpose) query = query.eq("purpose", f.purpose);
    if (f.state) query = query.eq("state", f.state);
    if (f.property_type) query = query.eq("property_type", f.property_type);
    if (f.bedrooms) query = query.gte("bedrooms", Number(f.bedrooms));
    if (f.q) query = query.or(`title.ilike.%${f.q}%,description.ilike.%${f.q}%,city.ilike.%${f.q}%`);

    const { data: matches } = await query;
    if (!matches || matches.length === 0) continue;

    const searchQs = new URLSearchParams(f).toString();
    const removeUrl = `${siteUrl}/api/saved-searches/${search.id}`;

    const tmpl = savedSearchAlertEmail({
      email: search.email,
      label: search.label,
      searchUrl: `${siteUrl}/properties?${searchQs}`,
      unsubUrl: removeUrl,
      properties: matches.map((p) => ({
        title: p.title,
        city: p.city,
        state: p.state,
        priceNgn: p.price_ngn,
        url: `${siteUrl}/properties/${p.slug}`,
        image: p.cover_image_url ?? null,
      })),
    });

    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: search.email,
        subject: tmpl.subject,
        html: tmpl.html,
      });
      await supabase
        .from("saved_searches")
        .update({ last_notified_at: new Date().toISOString() })
        .eq("id", search.id);
      notified++;
    } catch {
      // continue with next search
    }
  }

  return NextResponse.json({ ok: true, notified });
}
