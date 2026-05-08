import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LayoutDashboard, Building2, Inbox, Users, Mail, Receipt, TrendingUp } from "lucide-react";

export const metadata = { title: "Admin" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role,full_name")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/");

  const nav = [
    { href: "/admin",               label: "Dashboard",   icon: LayoutDashboard },
    { href: "/admin/properties",    label: "Properties",  icon: Building2 },
    { href: "/admin/inquiries",     label: "Inquiries",   icon: Inbox },
    { href: "/admin/receipts",      label: "Receipts",    icon: Receipt },
    { href: "/admin/sales",         label: "Sales",       icon: TrendingUp },
    { href: "/admin/subscribers",   label: "Subscribers", icon: Users },
    { href: "/admin/newsletter",    label: "Newsletter",  icon: Mail },
  ];

  return (
    <div className="container py-4 md:py-8 grid gap-4 md:gap-8 lg:grid-cols-[220px_1fr]">
      <aside className="lg:sticky lg:top-20 self-start">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 lg:mb-3">
          Admin · {profile?.full_name?.split(" ")[0]}
        </div>
        {/* Mobile: horizontal scroll strip. Desktop: vertical list. */}
        <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0 border-b lg:border-b-0 mb-2 lg:mb-0">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground whitespace-nowrap shrink-0 lg:shrink lg:whitespace-normal"
            >
              <n.icon className="h-4 w-4 shrink-0" /> {n.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
