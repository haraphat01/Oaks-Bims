import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Building2, KeyRound, Hammer, ShieldCheck, Star, CheckCircle2 } from "lucide-react";
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
      {/* ── Hero ── */}
      <section className="relative">
        <div className="absolute inset-0 -z-10">
          <Image
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80"
            alt=""
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-transparent" />
        </div>
        <div className="container py-24 md:py-36 max-w-3xl text-white">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-xs font-medium tracking-wide text-white/90 mb-6">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            Nigeria&apos;s trusted real estate partner — home &amp; diaspora
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-semibold leading-[1.1] tracking-tight">
            Stop renting someone else&apos;s dream.<br className="hidden sm:block" /> Build yours in Nigeria.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed">
            Prime homes, land, and investment properties across all 36 states —
            with verified titles, transparent pricing, and a team that holds your
            hand from search to keys. Whether you&apos;re in Lagos or London, we make
            owning property in Nigeria effortless.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="text-base px-7">
              <Link href="/properties">
                See available properties <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20 hover:text-white text-base px-7">
              <Link href="/contact">Speak to an advisor — it&apos;s free</Link>
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
            {[
              "No hidden charges",
              "Verified C of O on every listing",
              "USD & GBP pricing available",
            ].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social proof strip ── */}
      <section className="border-y bg-secondary/30">
        <div className="container py-5">
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-3 text-sm text-muted-foreground text-center">
            {[
              { n: "36", label: "States across Nigeria" },
              { n: "100%", label: "Title-verified listings" },
              { n: "24/7", label: "Dedicated diaspora support" },
              { n: "₦0", label: "Hidden fees. Ever." },
            ].map(({ n, label }) => (
              <div key={n}>
                <span className="text-2xl font-serif font-bold text-foreground">{n}</span>
                <span className="ml-2">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section className="container py-20">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-widest text-primary font-medium">Everything under one roof</div>
          <h2 className="mt-2 text-3xl md:text-4xl font-serif font-semibold">
            We don&apos;t just sell you a property.<br className="hidden md:block" /> We protect your investment.
          </h2>
          <p className="mt-3 text-muted-foreground leading-relaxed max-w-xl">
            Most agents disappear after the handshake. We stay — managing, maintaining,
            and growing the value of what you own.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Building2,
              title: "Development",
              body: "We build from the ground up — residential estates, duplexes, and mixed-use developments delivered on time and on budget.",
            },
            {
              icon: KeyRound,
              title: "Property Management",
              body: "Living abroad? We handle tenants, rent collection, and maintenance so your investment earns while you sleep.",
            },
            {
              icon: Hammer,
              title: "Buying & Acquisition",
              body: "We search, negotiate, and close on your behalf. Full due diligence included — no nasty surprises after signing.",
            },
            {
              icon: ShieldCheck,
              title: "After-sale Care",
              body: "Renovation, fit-out, and ongoing upkeep. Your property stays in top condition and keeps appreciating in value.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border bg-card p-6 hover:border-primary/50 hover:shadow-sm transition">
              <div className="h-10 w-10 rounded-md bg-accent text-accent-foreground grid place-items-center">
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-4 font-semibold">{title}</div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/about">See how we work <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* ── Featured listings ── */}
      <section className="container pb-20">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-primary font-medium">Fresh on the market</div>
            <h2 className="mt-2 text-3xl md:text-4xl font-serif font-semibold">
              Properties you&apos;ll actually want to own
            </h2>
            <p className="mt-1 text-muted-foreground">
              Every listing is personally vetted by our team before it goes live.
            </p>
          </div>
          <Link
            href="/properties"
            className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1 shrink-0"
          >
            Browse all listings <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {properties.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            Listings coming soon — check back shortly or{" "}
            <Link href="/contact" className="text-primary hover:underline">get in touch</Link> to hear about off-market opportunities.
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
            <div className="mt-8 text-center">
              <Button asChild size="lg">
                <Link href="/properties">View all properties <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </>
        )}
      </section>

      {/* ── Browse by state ── */}
      <section className="bg-secondary/40 py-20">
        <div className="container">
          <div className="text-xs uppercase tracking-widest text-primary font-medium">Find your location</div>
          <h2 className="mt-2 text-3xl md:text-4xl font-serif font-semibold">
            Opportunities in every corner of Nigeria
          </h2>
          <p className="mt-2 text-muted-foreground max-w-xl">
            From Abuja&apos;s fast-rising suburbs to Lekki&apos;s luxury waterfront — wherever
            you want to plant your flag, we have listings waiting.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {FEATURED_STATES.map((s) => (
              <Link
                key={s}
                href={`/properties?state=${encodeURIComponent(s)}`}
                className="rounded-lg border bg-background px-4 py-6 text-center text-sm font-medium hover:border-primary hover:bg-primary/5 hover:shadow-sm transition"
              >
                {s}
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/properties">Explore all 36 states <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Why us ── */}
      <section className="container py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs uppercase tracking-widest text-primary font-medium">Why buyers choose us</div>
            <h2 className="mt-2 text-3xl md:text-4xl font-serif font-semibold leading-tight">
              The Nigerian real estate market is full of sharks. We&apos;re not one of them.
            </h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Fake listings. Disputed titles. Agents who ghost you after collecting fees.
              We built Oaks &amp; Bims because we were tired of seeing honest buyers
              get burned. Every property we list has been physically inspected, title-verified
              by an independent solicitor, and priced to reflect the real market.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Every title verified by an independent solicitor before listing",
                "Fixed-fee structure — you know every cost upfront",
                "After-purchase support included as standard",
                "Dedicated diaspora desk — fluent in your time zone",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link href="/contact">
                  Let&apos;s find your property <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-muted">
            <Image
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80"
              alt="Modern Nigerian home interior"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* ── Diaspora CTA ── */}
      <section className="container pb-20">
        <div className="rounded-2xl bg-primary text-primary-foreground p-7 sm:p-10 md:p-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-medium text-white/80 mb-4">
              🌍 &nbsp;For Nigerians in the UK, US, Canada &amp; beyond
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-semibold leading-tight">
              Your family back home deserves a great house. You deserve peace of mind.
            </h2>
            <p className="mt-4 text-primary-foreground/85 leading-relaxed">
              We know what it feels like to send money home and wonder if things are
              really getting done. That ends here. Virtual viewings, independent legal
              checks, escrow-backed payments, and a dedicated manager who sends you
              updates — not excuses.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-primary-foreground/80">
              {[
                "Live video tours — see every room before you commit",
                "USD, GBP & EUR pricing on every listing",
                "Escrow payment protection — your money is safe",
                "We handle everything. You just approve.",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0" /> {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary" className="text-base">
                <Link href="/signup">Create your free account</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground/40 hover:bg-primary-foreground/10 hover:text-primary-foreground text-base">
                <Link href="/contact">Book a free consultation</Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { k: "36", v: "States covered", sub: "Every part of Nigeria" },
              { k: "100%", v: "Verified titles", sub: "No documentation risk" },
              { k: "24/7", v: "Diaspora support", sub: "Always available for you" },
              { k: "₦0", v: "Hidden fees", sub: "Total pricing transparency" },
            ].map(({ k, v, sub }) => (
              <div key={k} className="rounded-xl bg-primary-foreground/10 p-5">
                <div className="text-3xl font-serif font-bold">{k}</div>
                <div className="font-semibold text-sm mt-1">{v}</div>
                <div className="text-xs text-primary-foreground/60 mt-0.5">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-secondary/40 py-20">
        <div className="container text-center max-w-2xl">
          <div className="text-xs uppercase tracking-widest text-primary font-medium mb-3">
            Ready to own?
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-semibold">
            The best time to buy property in Nigeria was 10 years ago. The second best time is today.
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Property values across Lagos, Abuja, and Port Harcourt have more than doubled
            in a decade. Every month you wait is money left on the table. Let&apos;s get you started — it costs nothing to browse.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="text-base px-8">
              <Link href="/properties">
                Browse available properties <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base px-8">
              <Link href="/contact">Talk to us first</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
