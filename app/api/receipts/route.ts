import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  inquiry_id:     z.string().uuid().nullable().optional(),
  property_id:    z.string().uuid().nullable().optional(),
  user_id:        z.string().uuid().nullable().optional(),
  buyer_name:     z.string().min(1).max(200),
  buyer_email:    z.string().email(),
  buyer_phone:    z.string().max(60).nullable().optional(),
  buyer_address:  z.string().max(500).nullable().optional(),
  amount_ngn:     z.number().positive(),
  payment_method: z.enum(["bank_transfer", "cash", "cheque", "pos", "online"]),
  payment_ref:    z.string().max(200).nullable().optional(),
  notes:          z.string().max(2000).nullable().optional(),
  status:         z.enum(["paid", "partial", "cancelled"]).default("paid"),
});

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await supabase
    .from("receipts")
    .select("*, properties(title,city,state,slug)")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

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
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.format() }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("receipts")
    .insert({ ...parsed.data, created_by: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
