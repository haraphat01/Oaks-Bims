import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, Inbox, Mail, User, Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PropertyCard } from "@/components/property-card";
import { SavedSearchManager } from "@/components/saved-search-manager";
import type { Property } from "@/lib/types";

export const metadata = { title: "My account" };

export default async function AccountPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/account");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: favRows } = await supabase
    .from("favorites")
    .select("property_id, properties:properties(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(12);

  const favorites = (favRows ?? [])
    .map((r: any) => r.properties as Property)
    .filter(Boolean);

  const { count: inquiryCount } = await supabase
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { data: savedSearches } = await supabase
    .from("saved_searches")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="container py-12 space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-primary">My account</div>
          <h1 className="mt-1 text-3xl md:text-4xl font-serif font-semibold">
            Welcome back, {profile?.full_name?.split(" ")[0] || "there"}.
          </h1>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={Heart} label="Saved properties" value={favorites.length} href="/account#favorites" />
        <Stat icon={Inbox} label="Your inquiries" value={inquiryCount ?? 0} href="/account#inquiries" />
        <Stat icon={Bell}  label="Search alerts" value={savedSearches?.length ?? 0} href="/account#alerts" />
      </div>

      <section id="favorites">
        <h2 className="text-2xl font-serif font-semibold mb-4 flex items-center gap-2"><Heart className="h-5 w-5 text-primary" /> Saved properties</h2>
        {favorites.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            You haven&apos;t saved anything yet. <Link href="/properties" className="text-primary hover:underline">Browse properties</Link>.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        )}
      </section>

      <section id="alerts">
        <h2 className="text-2xl font-serif font-semibold mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" /> Search alerts
        </h2>
        <SavedSearchManager initialSearches={savedSearches ?? []} />
      </section>

      <section className="rounded-xl border bg-card p-6 md:p-8">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Profile</h2>
        </div>
        <dl className="grid gap-3 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Full name</dt><dd className="font-medium">{profile?.full_name || "—"}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Email</dt><dd className="font-medium">{user.email}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Phone</dt><dd className="font-medium">{profile?.phone || "—"}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Country</dt><dd className="font-medium">{profile?.country || "—"}</dd></div>
        </dl>
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value, href }: { icon: any; label: string; value: React.ReactNode; href?: string }) {
  const inner = (
    <div className="rounded-xl border bg-card p-5 hover:border-primary transition-colors">
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Icon className="h-4 w-4" /> {label}</div>
      <div className="mt-2 text-2xl font-serif font-semibold truncate">{value}</div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
