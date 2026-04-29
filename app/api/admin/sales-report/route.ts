import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getResend, FROM_EMAIL } from "@/lib/resend";

const schema = z.object({
  to: z.string().email(),
  year: z.number(),
  month: z.number().nullable(),
  period: z.string(),
  stats: z.object({
    totalRevenue: z.number(),
    receiptCount: z.number(),
    paidCount: z.number(),
    partialCount: z.number(),
    cancelledCount: z.number(),
    avgTransaction: z.number(),
  }),
  monthlyBreakdown: z.array(z.object({
    month: z.number(),
    label: z.string(),
    count: z.number(),
    total: z.number(),
  })),
  methodBreakdown: z.array(z.object({
    method: z.string(),
    count: z.number(),
    total: z.number(),
  })),
  topProperties: z.array(z.object({
    title: z.string(),
    count: z.number(),
    total: z.number(),
  })),
});

export async function POST(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { to, period, stats, monthlyBreakdown, methodBreakdown, topProperties } = parsed.data;
  const fmt = (n: number) => "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 0 });

  const monthRows = monthlyBreakdown
    .filter((m) => m.total > 0)
    .map(
      (m) => `<tr>
        <td style="padding:5px 12px 5px 0;color:#64748b">${m.label}</td>
        <td style="padding:5px 0;font-weight:500">${fmt(m.total)}</td>
        <td style="padding:5px 0 5px 12px;color:#64748b;text-align:right">${m.count} receipt${m.count !== 1 ? "s" : ""}</td>
      </tr>`
    )
    .join("");

  const methodRows = methodBreakdown
    .map(
      (m) => `<tr>
        <td style="padding:5px 12px 5px 0;color:#64748b;text-transform:capitalize">${m.method.replace(/_/g, " ")}</td>
        <td style="padding:5px 0;font-weight:500">${fmt(m.total)}</td>
        <td style="padding:5px 0 5px 12px;color:#64748b;text-align:right">${m.count}</td>
      </tr>`
    )
    .join("");

  const propRows = topProperties
    .map(
      (p) => `<tr>
        <td style="padding:5px 12px 5px 0;color:#64748b">${p.title}</td>
        <td style="padding:5px 0;font-weight:500">${fmt(p.total)}</td>
        <td style="padding:5px 0 5px 12px;color:#64748b;text-align:right">${p.count}</td>
      </tr>`
    )
    .join("");

  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#0f172a">
      <div style="margin-bottom:24px">
        <div style="font-weight:700;font-size:18px">Oaks &amp; Bims Nigeria Limited</div>
        <div style="color:#64748b;font-size:12px">Sales Report</div>
      </div>

      <h1 style="font-size:20px;margin:0 0 4px">Sales Report — ${period}</h1>
      <p style="color:#64748b;font-size:13px;margin:0 0 24px">Generated on ${new Date().toLocaleDateString("en-NG", { day:"numeric", month:"long", year:"numeric" })}</p>

      <!-- Summary -->
      <table width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px">
        <tr>
          <td style="width:50%;padding:16px;background:#f0fdf4;border-radius:10px 0 0 10px;border:1px solid #bbf7d0;border-right:none">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#166534;margin-bottom:4px">Total Revenue</div>
            <div style="font-size:26px;font-weight:700;color:#0f5132">${fmt(stats.totalRevenue)}</div>
          </td>
          <td style="width:50%;padding:16px;background:#f8fafc;border-radius:0 10px 10px 0;border:1px solid #e2e8f0;border-left:none">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#64748b;margin-bottom:4px">Receipts Issued</div>
            <div style="font-size:26px;font-weight:700;color:#0f172a">${stats.receiptCount}</div>
          </td>
        </tr>
      </table>

      <table width="100%" cellspacing="0" cellpadding="0" style="font-size:14px;margin-bottom:8px">
        <tr>
          <td style="padding:4px 0;color:#64748b">Paid in full</td>
          <td style="padding:4px 0;font-weight:500;text-align:right">${stats.paidCount}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#64748b">Partial payment</td>
          <td style="padding:4px 0;font-weight:500;text-align:right">${stats.partialCount}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#64748b">Cancelled</td>
          <td style="padding:4px 0;font-weight:500;text-align:right">${stats.cancelledCount}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#64748b">Average transaction</td>
          <td style="padding:4px 0;font-weight:500;text-align:right">${stats.avgTransaction > 0 ? fmt(stats.avgTransaction) : "—"}</td>
        </tr>
      </table>

      ${monthRows ? `
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0"/>
      <div style="font-weight:600;margin-bottom:8px">Monthly breakdown</div>
      <table width="100%" cellspacing="0" cellpadding="0" style="font-size:14px">${monthRows}</table>
      ` : ""}

      ${methodRows ? `
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0"/>
      <div style="font-weight:600;margin-bottom:8px">By payment method</div>
      <table width="100%" cellspacing="0" cellpadding="0" style="font-size:14px">${methodRows}</table>
      ` : ""}

      ${propRows ? `
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0"/>
      <div style="font-weight:600;margin-bottom:8px">Top properties</div>
      <table width="100%" cellspacing="0" cellpadding="0" style="font-size:14px">${propRows}</table>
      ` : ""}

      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
      <p style="color:#64748b;font-size:12px;margin:0">Oaks &amp; Bims Nigeria Limited · RC: 1754177</p>
    </div>
  `;

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Sales Report — ${period} — Oaks & Bims`,
      html,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Email send failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
