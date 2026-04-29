/**
 * Supabase Auth Hook — Send Email
 *
 * Supabase calls this endpoint instead of its own mailer whenever it needs to
 * send an auth email (signup confirmation, password reset, magic link, etc.).
 *
 * HOW TO WIRE THIS UP IN SUPABASE:
 * 1. Go to Supabase Dashboard → Authentication → Hooks
 * 2. Click "Add hook" → choose "Send Email"
 * 3. Set URL to: https://your-domain.com/api/auth/send-email
 * 4. Add a secret (any strong random string) — copy it
 * 5. Add that string to your environment as SUPABASE_AUTH_HOOK_SECRET
 * 6. Save. Supabase will now POST here for every auth email.
 */

import { NextResponse } from "next/server";
import { getResend, FROM_EMAIL, authConfirmEmail, passwordResetEmail, magicLinkEmail } from "@/lib/resend";

export async function POST(req: Request) {
  // Verify the request is genuinely from Supabase
  const secret = process.env.SUPABASE_AUTH_HOOK_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { user, email_data } = body as {
    user: {
      email: string;
      user_metadata?: { full_name?: string };
    };
    email_data: {
      token: string;
      token_hash: string;
      redirect_to: string;
      email_action_type: string;
      site_url: string;
      token_new?: string;
      token_hash_new?: string;
    };
  };

  if (!user?.email || !email_data?.email_action_type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const { token_hash, redirect_to, email_action_type } = email_data;
  const fullName = user.user_metadata?.full_name ?? null;

  // Construct the Supabase verification URL
  const actionUrl =
    `${supabaseUrl}/auth/v1/verify` +
    `?token=${encodeURIComponent(token_hash)}` +
    `&type=${encodeURIComponent(email_action_type)}` +
    `&redirect_to=${encodeURIComponent(redirect_to)}`;

  let subject: string;
  let html: string;

  switch (email_action_type) {
    case "signup": {
      const tmpl = authConfirmEmail({ fullName, confirmUrl: actionUrl });
      subject = tmpl.subject;
      html = tmpl.html;
      break;
    }
    case "email_change":
    case "email_change_new": {
      const tmpl = authConfirmEmail({ fullName, confirmUrl: actionUrl, isEmailChange: true });
      subject = tmpl.subject;
      html = tmpl.html;
      break;
    }
    case "recovery": {
      const tmpl = passwordResetEmail({ fullName, resetUrl: actionUrl });
      subject = tmpl.subject;
      html = tmpl.html;
      break;
    }
    case "magiclink": {
      const tmpl = magicLinkEmail({ magicLink: actionUrl });
      subject = tmpl.subject;
      html = tmpl.html;
      break;
    }
    case "invite": {
      const tmpl = authConfirmEmail({ fullName, confirmUrl: actionUrl });
      subject = "You've been invited — Oaks & Bims";
      html = tmpl.html.replace("One last step.", "You've been invited.");
      break;
    }
    default:
      // Unknown type — let Supabase fall back to its own mailer
      return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject,
      html,
    });
  } catch (err) {
    console.error("[auth/send-email] Resend error:", err);
    // Return 500 so Supabase knows delivery failed and can retry
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Email send failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
