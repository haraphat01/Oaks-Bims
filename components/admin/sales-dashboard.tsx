"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Download, Mail, Loader2, Check, TrendingUp,
  CreditCard, ReceiptText, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PAYMENT_METHOD_LABEL, type Receipt } from "@/lib/types";

type ReceiptRow = Receipt & { properties: { title: string; city: string; state: string } | null };

type Props = {
  receipts: ReceiptRow[];
  stats: {
    totalRevenue: number;
    receiptCount: number;
    paidCount: number;
    partialCount: number;
    cancelledCount: number;
    avgTransaction: number;
  };
  monthlyBreakdown: Array<{ month: number; label: string; count: number; total: number }>;
  methodBreakdown: Array<{ method: string; count: number; total: number }>;
  topProperties: Array<{ title: string; count: number; total: number }>;
  year: number;
  month: number | null;
  statusFilter: string;
  years: number[];
};

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const STATUS_VARIANT: Record<string, "success" | "warning" | "destructive"> = {
  paid: "success", partial: "warning", cancelled: "destructive",
};

function fmt(n: number) {
  return "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function SalesDashboard({
  receipts, stats, monthlyBreakdown, methodBreakdown, topProperties,
  year, month, statusFilter, years,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [reportEmail, setReportEmail] = useState("");

  function navigate(params: Record<string, string>) {
    const sp = new URLSearchParams();
    sp.set("year", String(year));
    if (month) sp.set("month", String(month));
    if (statusFilter !== "all") sp.set("status", statusFilter);
    Object.entries(params).forEach(([k, v]) => {
      if (v === "" || v === "all" || v === "0") sp.delete(k);
      else sp.set(k, v);
    });
    startTransition(() => router.push(`/admin/sales?${sp}`));
  }

  function downloadCSV() {
    const headers = [
      "Receipt #","Date","Buyer Name","Buyer Email","Buyer Phone",
      "Property","Amount (NGN)","Payment Method","Reference","Status","Notes",
    ];
    const rows = receipts.map((r) => [
      r.receipt_number,
      new Date(r.created_at).toLocaleDateString("en-GB"),
      r.buyer_name,
      r.buyer_email,
      r.buyer_phone ?? "",
      r.properties?.title ?? "",
      Number(r.amount_ngn).toFixed(2),
      (PAYMENT_METHOD_LABEL[r.payment_method] ?? r.payment_method),
      r.payment_ref ?? "",
      r.status,
      r.notes ?? "",
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const suffix = month ? `-${String(month).padStart(2, "0")}` : "";
    a.download = `oaks-bims-sales-${year}${suffix}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function sendReport(e: React.FormEvent) {
    e.preventDefault();
    if (!reportEmail) return;
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch("/api/admin/sales-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: reportEmail,
          year,
          month,
          stats,
          monthlyBreakdown,
          methodBreakdown,
          topProperties,
          period: month ? `${MONTH_NAMES[month - 1]} ${year}` : `${year} (all months)`,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Send failed");
      }
      setSent(true);
      setShowEmailInput(false);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  const maxBar = Math.max(...monthlyBreakdown.map((m) => m.total), 1);
  const periodLabel = month ? `${MONTH_NAMES[month - 1]} ${year}` : `${year}`;

  return (
    <div className="space-y-6">
      {/* ── Filters + Actions ── */}
      <div className="flex flex-wrap items-end gap-3 no-print">
        <div className="flex flex-wrap gap-2">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Year</label>
            <Select
              value={String(year)}
              onChange={(e) => navigate({ year: e.target.value, month: "" })}
              className="w-28"
            >
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Month</label>
            <Select
              value={month ? String(month) : ""}
              onChange={(e) => navigate({ month: e.target.value })}
              className="w-36"
            >
              <option value="">All months</option>
              {MONTH_NAMES.map((name, i) => (
                <option key={i + 1} value={i + 1}>{name}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Status</label>
            <Select
              value={statusFilter}
              onChange={(e) => navigate({ status: e.target.value })}
              className="w-36"
            >
              <option value="all">All statuses</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 ml-auto items-end">
          <Button variant="outline" size="sm" onClick={downloadCSV} disabled={receipts.length === 0}>
            <Download className="h-4 w-4" /> Download CSV
          </Button>

          {sent ? (
            <Button variant="outline" size="sm" disabled>
              <Check className="h-4 w-4 text-emerald-600" /> Report sent
            </Button>
          ) : showEmailInput ? (
            <form onSubmit={sendReport} className="flex gap-2 items-center">
              <input
                type="email"
                required
                autoFocus
                placeholder="recipient@email.com"
                value={reportEmail}
                onChange={(e) => setReportEmail(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring w-52"
              />
              <Button type="submit" size="sm" disabled={sending}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                Send
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowEmailInput(false)}>
                Cancel
              </Button>
            </form>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setSent(false); setShowEmailInput(true); }}
              disabled={receipts.length === 0}
            >
              <Mail className="h-4 w-4" /> Send report
            </Button>
          )}
        </div>
        {sendError && <p className="w-full text-xs text-destructive">{sendError}</p>}
      </div>

      {/* ── Stats cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={TrendingUp}
          label="Total revenue"
          value={fmt(stats.totalRevenue)}
          sub={periodLabel}
          highlight
        />
        <StatCard
          icon={ReceiptText}
          label="Receipts"
          value={stats.receiptCount}
          sub={`${stats.paidCount} paid · ${stats.partialCount} partial`}
        />
        <StatCard
          icon={CreditCard}
          label="Avg transaction"
          value={stats.avgTransaction > 0 ? fmt(stats.avgTransaction) : "—"}
          sub="excluding cancelled"
        />
        <StatCard
          icon={BarChart3}
          label="Cancelled"
          value={stats.cancelledCount}
          sub="receipts voided"
        />
      </div>

      {/* ── Chart + Breakdowns ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Bar chart */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-5">
          <div className="text-sm font-semibold mb-4">Monthly revenue — {year}</div>
          <div className="flex items-end gap-1" style={{ height: 160 }}>
            {monthlyBreakdown.map((m) => {
              const pct = m.total > 0 ? Math.max((m.total / maxBar) * 100, 3) : 0;
              const isSelected = month === m.month;
              const isCurrent = m.month === new Date().getMonth() + 1 && year === new Date().getFullYear();
              return (
                <button
                  key={m.month}
                  onClick={() => navigate({ month: isSelected ? "" : String(m.month) })}
                  className="flex-1 flex flex-col items-center gap-1 min-w-0 group"
                  title={`${m.label}: ${fmt(m.total)} (${m.count} receipt${m.count !== 1 ? "s" : ""})`}
                >
                  <div className="w-full flex flex-col justify-end" style={{ height: 140 }}>
                    <div
                      className={`w-full rounded-t-sm transition-all duration-200 ${
                        isSelected
                          ? "bg-primary"
                          : isCurrent
                          ? "bg-primary/60"
                          : "bg-primary/25 group-hover:bg-primary/45"
                      }`}
                      style={{ height: `${pct}%` }}
                    />
                  </div>
                  <span className={`text-[9px] leading-none ${isSelected ? "font-bold text-primary" : "text-muted-foreground"}`}>
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-3">Click a bar to filter by that month.</p>
        </div>

        {/* Side breakdowns */}
        <div className="space-y-4">
          {/* Payment methods */}
          <div className="rounded-xl border bg-card p-5">
            <div className="text-sm font-semibold mb-3">By payment method</div>
            {methodBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data</p>
            ) : (
              <div className="space-y-2">
                {methodBreakdown.map((m) => (
                  <div key={m.method} className="flex items-center justify-between text-sm gap-2">
                    <span className="text-muted-foreground capitalize truncate">
                      {PAYMENT_METHOD_LABEL[m.method as keyof typeof PAYMENT_METHOD_LABEL] ?? m.method}
                    </span>
                    <span className="font-medium shrink-0">{fmt(m.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top properties */}
          <div className="rounded-xl border bg-card p-5">
            <div className="text-sm font-semibold mb-3">Top properties</div>
            {topProperties.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data</p>
            ) : (
              <div className="space-y-2">
                {topProperties.map((p) => (
                  <div key={p.title} className="flex items-center justify-between text-sm gap-2">
                    <span className="text-muted-foreground truncate">{p.title}</span>
                    <span className="font-medium shrink-0">{fmt(p.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Receipts table ── */}
      <div className="rounded-xl border overflow-hidden">
        <div className="px-5 py-3 border-b bg-secondary/30 flex items-center justify-between">
          <div className="text-sm font-semibold">
            {receipts.length} receipt{receipts.length !== 1 ? "s" : ""} — {periodLabel}
          </div>
        </div>

        {receipts.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No receipts for this period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/20">
                <tr>
                  {["Receipt #","Date","Buyer","Property","Amount","Method","Status",""].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {receipts.map((r) => (
                  <tr key={r.id} className="hover:bg-secondary/10">
                    <td className="px-4 py-2.5 font-mono text-primary font-semibold">{r.receipt_number}</td>
                    <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
                      {new Date(r.created_at).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="font-medium">{r.buyer_name}</div>
                      <div className="text-xs text-muted-foreground">{r.buyer_email}</div>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {r.properties?.title ?? <span className="italic">—</span>}
                    </td>
                    <td className="px-4 py-2.5 font-semibold whitespace-nowrap">{fmt(Number(r.amount_ngn))}</td>
                    <td className="px-4 py-2.5 text-muted-foreground capitalize whitespace-nowrap">
                      {r.payment_method.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant={STATUS_VARIANT[r.status] ?? "secondary"} className="capitalize">
                        {r.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/receipts/${r.id}`}>View</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Totals footer */}
              <tfoot className="border-t bg-secondary/20">
                <tr>
                  <td colSpan={4} className="px-4 py-2.5 text-sm font-semibold text-right">Total</td>
                  <td className="px-4 py-2.5 font-bold text-primary whitespace-nowrap">
                    {fmt(stats.totalRevenue)}
                  </td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, sub, highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-5 ${highlight ? "bg-primary text-primary-foreground" : "bg-card"}`}>
      <div className={`flex items-center gap-2 text-xs mb-1 ${highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
        <Icon className="h-4 w-4" /> {label}
      </div>
      <div className={`text-2xl font-serif font-semibold ${highlight ? "" : ""}`}>{value}</div>
      {sub && <div className={`text-xs mt-0.5 ${highlight ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{sub}</div>}
    </div>
  );
}
