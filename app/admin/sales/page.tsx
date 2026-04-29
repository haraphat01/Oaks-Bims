import { createClient } from "@/lib/supabase/server";
import { SalesDashboard } from "@/components/admin/sales-dashboard";
import type { Receipt } from "@/lib/types";

export const metadata = { title: "Sales & Revenue" };

type ReceiptRow = Receipt & { properties: { title: string; city: string; state: string } | null };

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default async function SalesPage({
  searchParams,
}: {
  searchParams: { year?: string; month?: string; status?: string };
}) {
  const now = new Date();
  const year = Number(searchParams.year ?? now.getFullYear());
  const month = searchParams.month ? Number(searchParams.month) : null; // 1-12 or null
  const statusFilter = searchParams.status ?? "all";

  const supabase = createClient();

  // Fetch entire year for the chart, then filter client-side for the table
  const { data } = await supabase
    .from("receipts")
    .select("*, properties(title,city,state,slug)")
    .gte("created_at", `${year}-01-01T00:00:00.000Z`)
    .lt("created_at", `${year + 1}-01-01T00:00:00.000Z`)
    .order("created_at", { ascending: false });

  const yearReceipts = (data ?? []) as ReceiptRow[];

  // Apply month + status filter for table / stats
  let filtered = yearReceipts;
  if (month) filtered = filtered.filter((r) => new Date(r.created_at).getMonth() + 1 === month);
  if (statusFilter !== "all") filtered = filtered.filter((r) => r.status === statusFilter);

  // --- Aggregations on filtered set ---
  const active = filtered.filter((r) => r.status !== "cancelled");
  const totalRevenue = active.reduce((s, r) => s + Number(r.amount_ngn), 0);
  const avgTransaction = active.length > 0 ? totalRevenue / active.length : 0;

  // Monthly breakdown (full year, for the bar chart)
  const monthlyBreakdown = MONTH_LABELS.map((label, i) => {
    const mrs = yearReceipts.filter((r) => {
      return new Date(r.created_at).getMonth() === i && r.status !== "cancelled";
    });
    return {
      month: i + 1,
      label,
      count: mrs.length,
      total: mrs.reduce((s, r) => s + Number(r.amount_ngn), 0),
    };
  });

  // Payment method breakdown
  const methodMap = new Map<string, { count: number; total: number }>();
  for (const r of active) {
    const prev = methodMap.get(r.payment_method) ?? { count: 0, total: 0 };
    methodMap.set(r.payment_method, { count: prev.count + 1, total: prev.total + Number(r.amount_ngn) });
  }
  const methodBreakdown = [...methodMap.entries()]
    .map(([method, d]) => ({ method, ...d }))
    .sort((a, b) => b.total - a.total);

  // Top properties by revenue
  const propMap = new Map<string, { count: number; total: number }>();
  for (const r of active) {
    const key = r.properties?.title ?? "No property";
    const prev = propMap.get(key) ?? { count: 0, total: 0 };
    propMap.set(key, { count: prev.count + 1, total: prev.total + Number(r.amount_ngn) });
  }
  const topProperties = [...propMap.entries()]
    .map(([title, d]) => ({ title, ...d }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-semibold">Sales &amp; Revenue</h1>
        <p className="text-muted-foreground mt-1">Revenue analytics from issued receipts.</p>
      </div>
      <SalesDashboard
        receipts={filtered}
        stats={{
          totalRevenue,
          receiptCount: filtered.length,
          paidCount: filtered.filter((r) => r.status === "paid").length,
          partialCount: filtered.filter((r) => r.status === "partial").length,
          cancelledCount: filtered.filter((r) => r.status === "cancelled").length,
          avgTransaction,
        }}
        monthlyBreakdown={monthlyBreakdown}
        methodBreakdown={methodBreakdown}
        topProperties={topProperties}
        year={year}
        month={month}
        statusFilter={statusFilter}
        years={years}
      />
    </div>
  );
}
