import Link from "next/link";
import { Building2, Inbox, Users, AlertCircle, Receipt } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = createClient();

  const [propsRes, availRes, inqRes, openInqRes, subsRes, confSubsRes, receiptsRes] = await Promise.all([
    supabase.from("properties").select("id", { count: "exact", head: true }),
    supabase.from("properties").select("id", { count: "exact", head: true }).eq("status", "available"),
    supabase.from("inquiries").select("id", { count: "exact", head: true }),
    supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("is_handled", false),
    supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
    supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }).eq("is_confirmed", true),
    supabase.from("receipts").select("id", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Total properties",       value: propsRes.count ?? 0,      icon: Building2,  href: "/admin/properties" },
    { label: "Available listings",     value: availRes.count ?? 0,      icon: Building2,  href: "/admin/properties" },
    { label: "Open inquiries",         value: openInqRes.count ?? 0,    icon: AlertCircle,href: "/admin/inquiries" },
    { label: "Total inquiries",        value: inqRes.count ?? 0,        icon: Inbox,      href: "/admin/inquiries" },
    { label: "Receipts issued",        value: receiptsRes.count ?? 0,   icon: Receipt,    href: "/admin/receipts" },
    { label: "Confirmed subscribers",  value: confSubsRes.count ?? 0,   icon: Users,      href: "/admin/subscribers" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of activity across the site.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-xl border bg-card p-5 hover:border-primary transition-colors">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><s.icon className="h-4 w-4" /> {s.label}</div>
            <div className="mt-2 text-3xl font-serif font-semibold">{s.value}</div>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold">Quick actions</h2>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Link href="/admin/properties/new" className="rounded-md border px-3 py-2 hover:bg-accent">+ New property</Link>
          <Link href="/admin/receipts/new" className="rounded-md border px-3 py-2 hover:bg-accent">+ New receipt</Link>
          <Link href="/admin/newsletter" className="rounded-md border px-3 py-2 hover:bg-accent">Send newsletter</Link>
          <Link href="/admin/inquiries" className="rounded-md border px-3 py-2 hover:bg-accent">View inquiries</Link>
        </div>
      </div>
    </div>
  );
}
