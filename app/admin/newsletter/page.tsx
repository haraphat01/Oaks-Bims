import { createClient } from "@/lib/supabase/server";
import { NewsletterSender } from "@/components/admin/newsletter-sender";
import type { Property } from "@/lib/types";

export default async function AdminNewsletterPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("properties")
    .select("*")
    .eq("status", "available")
    .order("created_at", { ascending: false })
    .limit(30);
  const properties = (data ?? []) as Property[];

  const { count: confirmedCount } = await supabase
    .from("newsletter_subscribers")
    .select("id", { count: "exact", head: true })
    .eq("is_confirmed", true);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-semibold">Send newsletter</h1>
        <p className="text-muted-foreground mt-1">
          Pick up to 10 properties to feature. We&apos;ll email all {confirmedCount ?? 0} confirmed subscribers via Resend.
        </p>
      </div>

      <NewsletterSender properties={properties} />
    </div>
  );
}
