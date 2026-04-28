import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getResend, FROM_EMAIL, newListingsEmail } from "@/lib/resend";
import type { Property, NewsletterSubscriber } from "@/lib/types";

const schema = z.object({
  property_ids: z.array(z.string().uuid()).min(1).max(10),
});

/**
 * Admin-only: send the latest selected listings to all confirmed subscribers.
 */
export async function POST(req: Request) {
  // Ensure caller is admin
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const service = createServiceClient();

  const { data: properties } = await service
    .from("properties")
    .select("*")
    .in("id", parsed.data.property_ids);
  const props = (properties ?? []) as Property[];
  if (props.length === 0) return NextResponse.json({ error: "No properties" }, { status: 400 });

  const { data: subs } = await service
    .from("newsletter_subscribers")
    .select("*")
    .eq("is_confirmed", true);
  const subscribers = (subs ?? []) as NewsletterSubscriber[];

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  const resend = getResend();

  let sent = 0;
  for (const s of subscribers) {
    const tmpl = newListingsEmail({
      fullName: s.full_name,
      unsubUrl: `${baseUrl}/api/newsletter/unsubscribe?token=${s.unsub_token}`,
      properties: props.map((p) => ({
        title: p.title,
        city: p.city,
        state: p.state,
        priceNgn: Number(p.price_ngn),
        url: `${baseUrl}/properties/${p.slug}`,
        image: p.cover_image_url ?? p.image_urls[0] ?? null,
      })),
    });
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: s.email,
        subject: tmpl.subject,
        html: tmpl.html,
      });
      sent++;
    } catch (err) {
      console.error(`Failed to send to ${s.email}:`, err);
    }
  }

  return NextResponse.json({ ok: true, sent, total: subscribers.length });
}
