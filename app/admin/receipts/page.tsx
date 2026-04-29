import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Receipt } from "@/lib/types";

export const metadata = { title: "Receipts" };

const STATUS_VARIANT: Record<string, "success" | "warning" | "destructive"> = {
  paid: "success", partial: "warning", cancelled: "destructive",
};

export default async function AdminReceiptsPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("receipts")
    .select("*, properties(title,city,state)")
    .order("created_at", { ascending: false })
    .limit(200);

  const receipts = (data ?? []) as (Receipt & {
    properties: { title: string; city: string; state: string } | null;
  })[];

  const fmt = (n: number) => "₦" + n.toLocaleString("en-NG");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-semibold">Receipts</h1>
          <p className="text-muted-foreground mt-1">Payment receipts issued to buyers.</p>
        </div>
        <Button asChild>
          <Link href="/admin/receipts/new">
            <Plus className="h-4 w-4" /> New receipt
          </Link>
        </Button>
      </div>

      {receipts.length === 0 ? (
        <div className="rounded-xl border border-dashed p-14 text-center text-sm text-muted-foreground">
          No receipts yet.{" "}
          <Link href="/admin/receipts/new" className="text-primary hover:underline">
            Create the first one.
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40">
              <tr>
                {["Receipt #", "Buyer", "Property", "Amount", "Method", "Date", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {receipts.map((r) => (
                <tr key={r.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-primary">{r.receipt_number}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.buyer_name}</div>
                    <div className="text-xs text-muted-foreground">{r.buyer_email}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {r.properties ? (
                      <span>{r.properties.title}<br/><span className="text-xs">{r.properties.city}, {r.properties.state}</span></span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 font-semibold">{fmt(r.amount_ngn)}</td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{r.payment_method.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[r.status] ?? "secondary"} className="capitalize">
                      {r.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/receipts/${r.id}`}>View</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
