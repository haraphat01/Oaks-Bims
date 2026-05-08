import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import type { NewsletterSubscriber } from "@/lib/types";

export default async function AdminSubscribersPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false });
  const subs = (data ?? []) as NewsletterSubscriber[];

  const confirmed = subs.filter((s) => s.is_confirmed).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-semibold">Newsletter subscribers</h1>
        <p className="text-muted-foreground mt-1">
          {confirmed} confirmed · {subs.length - confirmed} pending · {subs.length} total
        </p>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3">Email</th>
                <th className="p-3 hidden sm:table-cell">Name</th>
                <th className="p-3">Status</th>
                <th className="p-3 hidden sm:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-3 max-w-[200px]">
                    <div className="truncate">{s.email}</div>
                    <div className="text-xs text-muted-foreground sm:hidden">{new Date(s.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="p-3 text-muted-foreground hidden sm:table-cell">{s.full_name || "—"}</td>
                  <td className="p-3">
                    <Badge variant={s.is_confirmed ? "success" : "warning"}>
                      {s.is_confirmed ? "Confirmed" : "Pending"}
                    </Badge>
                  </td>
                  <td className="p-3 text-muted-foreground whitespace-nowrap hidden sm:table-cell">
                    {new Date(s.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {subs.length === 0 && (
                <tr><td className="p-10 text-center text-muted-foreground" colSpan={4}>No subscribers yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
