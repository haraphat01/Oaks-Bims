import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToggleHandled } from "@/components/admin/toggle-handled";
import type { Inquiry } from "@/lib/types";

export default async function AdminInquiriesPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("inquiries")
    .select("*, properties(slug,title)")
    .order("created_at", { ascending: false })
    .limit(200);
  const inquiries = (data ?? []) as (Inquiry & { properties: { slug: string; title: string } | null })[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-semibold">Inquiries</h1>
        <p className="text-muted-foreground mt-1">Messages from the contact form and property pages.</p>
      </div>

      {inquiries.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          No inquiries yet.
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((q) => (
            <div key={q.id} className="rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{q.full_name}</div>
                  <div className="text-sm text-muted-foreground">
                    <a className="hover:text-primary" href={`mailto:${q.email}`}>{q.email}</a>
                    {q.phone ? ` · ${q.phone}` : ""}
                    {q.country ? ` · ${q.country}` : ""}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={q.is_handled ? "success" : "warning"}>
                    {q.is_handled ? "Handled" : "Open"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{new Date(q.created_at).toLocaleString()}</span>
                </div>
              </div>
              {q.properties && (
                <div className="mt-2 text-xs">
                  Re: <Link className="text-primary hover:underline" href={`/properties/${q.properties.slug}`}>{q.properties.title}</Link>
                </div>
              )}
              <p className="mt-3 text-sm whitespace-pre-line">{q.message}</p>
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <ToggleHandled id={q.id} initial={q.is_handled} />
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/receipts/new?inquiry=${q.id}`}>Create receipt</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
