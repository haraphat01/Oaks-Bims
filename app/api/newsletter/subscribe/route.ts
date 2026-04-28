import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";
import { getResend, FROM_EMAIL, subscribeConfirmEmail } from "@/lib/resend";

const schema = z.object({
  email: z.string().email().max(320),
  full_name: z.string().min(1).max(120).nullable().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
  const { email, full_name } = parsed.data;

  const supabase = createServiceClient();

  // Upsert subscriber. If they re-subscribe, regenerate confirm token.
  const { data: existing } = await supabase
    .from("newsletter_subscribers")
    .select("id, is_confirmed, confirm_token, full_name")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  let confirmToken: string;
  let recipientName = full_name ?? existing?.full_name ?? null;

  if (existing) {
    if (existing.is_confirmed) {
      // already subscribed — be quiet about it
      return NextResponse.json({ ok: true, already: true });
    }
    confirmToken = existing.confirm_token;
  } else {
    const { data: row, error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: email.toLowerCase(), full_name })
      .select("confirm_token")
      .single();
    if (error || !row) {
      return NextResponse.json({ error: error?.message ?? "Insert failed" }, { status: 500 });
    }
    confirmToken = row.confirm_token;
  }

  // Send confirm email
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  const confirmUrl = `${baseUrl}/api/newsletter/confirm?token=${confirmToken}`;
  try {
    const tmpl = subscribeConfirmEmail({ fullName: recipientName, confirmUrl });
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: tmpl.subject,
      html: tmpl.html,
    });
  } catch (err) {
    // We still return 200 so we don't leak whether the address already exists.
    console.error("Resend send failed:", err);
  }

  return NextResponse.json({ ok: true });
}
