import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Building2, KeyRound, Hammer, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/property-card";
import { createClient } from "@/lib/supabase/server";
import { FEATURED_STATES } from "@/lib/nigeria-states";
import type { Property } from "@/lib/types";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = createClient();
  const { data: featured } = await supabase
    .from("properties")
    .select("*")
    .eq("status", "available")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(6);

  const properties = (featured ?? []) as Property[];

  return (
    <>
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 -z-10">
          <Image
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80"
            alt=""
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        </div>
        <div className="container py-24 md:py-32 max-w-3xl text-white">
          <div className="text-xs uppercase tracking-[0.2em] text-white/80">Real estate · Development · Property management</div>
          <h1 className="mt-3 text-4xl md:text-6xl font-serif font-semibold leading-tight">
            Own a piece of Nigeria — wherever you are in the world.
          </h1>
          <p className="mt-5 text-lg text-white/90 max-w-2xl">
            Curated homes, land, and developments across all 36 states. Verified titles, transparent pricing, and end-to-end support for buyers in Nigeria and the diaspora.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/properties">Browse properties <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white">
              <Link href="/contact">Talk to an advisor</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="container py-20">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-widest text-primary">What we do</div>
          <h2 className="mt-2 text-3xl md:text-4xl font-serif font-semibold">Four pillars, one trusted partner.</h2>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Building2, title: "Real Estate Development", body: "Concept-to-keys delivery of residential and mixed-use developments across Nigeria." },
            { icon: KeyRound,   title: "Property Management", body: "Tenant sourcing, rent collection, maintenance, and reporting — owners abroad welcome." },
            { icon: Hammer,     title: "Purchasing & Acquisition", body: "Search, due-diligence, negotiation, and closing — handled end-to-end on your behalf." },
            { icon: ShieldCheck,title: "After-sale & Renovation", body: "Refurbishment, fit-out, and ongoing care so your property keeps its value." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border bg-card p-6">
              <div className="h-10 w-10 rounded-md bg-accent text-accent-foreground grid place-items-center"><Icon className="h-5 w-5" /></div>
              <div className="mt-4 font-semibold">{title}</div>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured properties */}
      <section className="container pb-20">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-primary">Featured listings</div>
            <h2 className="mt-2 text-3xl md:text-4xl font-serif font-semibold">Hand-picked this week</h2>
          </div>
          <Link href="/properties" className="text-sm font-medium text-primary hover:underline hidden md:inline-flex items-center gap-1">
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {properties.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            No featured listings yet. Run <code>supabase/seed.sql</code> in your Supabase SQL editor, or add some from the admin panel.
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        )}
      </section>

      {/* Browse by state */}
      <section className="bg-secondary/40 py-20">
        <div className="container">
          <div className="text-xs uppercase tracking-widest text-primary">By location</div>
          <h2 className="mt-2 text-3xl md:text-4xl font-serif font-semibold">Browse by state</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {FEATURED_STATES.map((s) => (
              <Link
                key={s}
                href={`/properties?state=${encodeURIComponent(s)}`}
                className="rounded-lg border bg-background px-4 py-6 text-center text-sm font-medium hover:border-primary hover:shadow-sm transition"
              >
                {s}
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button asChild variant="outline">
              <Link href="/properties">View all 36 states</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Diaspora CTA */}
      <section className="container py-20">
        <div className="rounded-2xl bg-primary text-primary-foreground p-7 sm:p-10 md:p-16 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-primary-foreground/80">Diaspora buyers</div>
            <h2 className="mt-3 text-3xl md:text-4xl font-serif font-semibold">Buying from abroad? We&apos;ve got you.</h2>
            <p className="mt-4 text-primary-foreground/90 leading-relaxed">
              Live virtual viewings. Title verification by independent solicitors. USD &amp; GBP pricing on every listing. Escrow-backed payments. We&apos;ve helped Nigerians in the US, UK, Canada, and the UAE buy with peace of mind.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link href="/signup">Create a buyer account</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground/40 hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Link href="/contact">Book a free consultation</Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { k: "36", v: "States covered" },
              { k: "100%", v: "Verified titles" },
              { k: "24/7", v: "Diaspora support" },
            ].map(({ k, v }) => (
              <div key={k} className="rounded-xl bg-primary-foreground/10 p-6">
                <div className="text-3xl font-serif font-semibold">{k}</div>
                <div className="text-xs uppercase tracking-widest mt-1 text-primary-foreground/80">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
