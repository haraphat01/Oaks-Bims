import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getResend, FROM_EMAIL, receiptEmail } from "@/lib/resend";
import { PAYMENT_METHOD_LABEL } from "@/lib/types";

type Props = { params: { id: string } };

export async function POST(_req: Request, { params }: Props) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: receipt, error } = await supabase
    .from("receipts")
    .select("*, properties(title,city,state)")
    .eq("id", params.id)
    .single();

  if (error || !receipt) return NextResponse.json({ error: "Receipt not found" }, { status: 404 });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const property = receipt.properties as { title: string; city: string; state: string } | null;

  const tmpl = receiptEmail({
    receiptNumber: receipt.receipt_number,
    buyerName: receipt.buyer_name,
    buyerEmail: receipt.buyer_email,
    buyerPhone: receipt.buyer_phone,
    propertyTitle: property?.title ?? null,
    propertyLocation: property ? `${property.city}, ${property.state}` : null,
    amountNgn: receipt.amount_ngn,
    paymentMethod: PAYMENT_METHOD_LABEL[receipt.payment_method as keyof typeof PAYMENT_METHOD_LABEL] ?? receipt.payment_method,
    paymentRef: receipt.payment_ref,
    status: receipt.status,
    notes: receipt.notes,
    receiptUrl: `${siteUrl}/admin/receipts/${receipt.id}`,
    date: new Date(receipt.created_at).toLocaleDateString("en-NG", {
      day: "numeric", month: "long", year: "numeric",
    }),
  });

  try {
    await getResend().emails.send({
      from: FROM_EMAIL,
      to: receipt.buyer_email,
      subject: tmpl.subject,
      html: tmpl.html,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Email send failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
