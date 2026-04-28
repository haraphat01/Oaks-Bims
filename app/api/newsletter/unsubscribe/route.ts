import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/?newsletter=invalid", url.origin));

  const supabase = createServiceClient();
  await supabase.from("newsletter_subscribers").delete().eq("unsub_token", token);
  return NextResponse.redirect(new URL("/?newsletter=unsubscribed", url.origin));
}
