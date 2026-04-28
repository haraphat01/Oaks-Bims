import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/?newsletter=invalid", url.origin));

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .update({ is_confirmed: true, confirmed_at: new Date().toISOString() })
    .eq("confirm_token", token)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    return NextResponse.redirect(new URL("/?newsletter=invalid", url.origin));
  }
  return NextResponse.redirect(new URL("/?newsletter=confirmed", url.origin));
}
