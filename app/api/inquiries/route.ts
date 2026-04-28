import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getResend, FROM_EMAIL, adminInquiryAlertEmail } from "@/lib/resend";

const schema = z.object({
  property_id: z.string().uuid().nullable().optional(),
  full_name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).nullable().optional(),
  country: z.string().max(120).nullable().optional(),
  message: z.string().min(5).max(4000),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.format() }, { status: 400 });
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from("inquiries").insert({
    ...parsed.data,
    user_id: user?.id ?? null,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send admin notification (fire-and-forget — never blocks the response)
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (adminEmail) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    let propertyTitle: string | null = null;
    if (parsed.data.property_id) {
      const { data: prop } = await supabase
        .from("properties")
        .select("title")
        .eq("id", parsed.data.property_id)
        .single();
      propertyTitle = prop?.title ?? null;
    }
    try {
      const tmpl = adminInquiryAlertEmail({
        fullName: parsed.data.full_name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        country: parsed.data.country,
        message: parsed.data.message,
        propertyTitle,
        adminUrl: `${siteUrl}/admin/inquiries`,
      });
      await getResend().emails.send({
        from: FROM_EMAIL,
        to: adminEmail,
        subject: tmpl.subject,
        html: tmpl.html,
      });
    } catch {
      // Non-critical — log in production but don't fail the request
    }
  }

  return NextResponse.json({ ok: true });
}
