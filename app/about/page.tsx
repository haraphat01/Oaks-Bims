import { Building2, KeyRound, Hammer, ShieldCheck, Globe2 } from "lucide-react";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <div className="container py-12 md:py-20 max-w-4xl">
      <div className="text-xs uppercase tracking-widest text-primary">About us</div>
      <h1 className="mt-2 text-4xl md:text-5xl font-serif font-semibold">
        Real estate, built on trust.
      </h1>
      <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
        Oaks &amp; Bims Nigeria Limited is a full-service real estate company helping Nigerians at home and abroad
        develop, buy, and manage property across all 36 states. We bring transparency, verified titles, and
        white-glove service to a market that has historically struggled with all three.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {[
          { icon: Building2, title: "Development", body: "We design, build, and deliver residential and mixed-use projects — from infill plots to multi-block estates." },
          { icon: KeyRound,   title: "Property Management", body: "We handle tenants, rent collection, maintenance, and reporting so owners can stay hands-off." },
          { icon: Hammer,     title: "Purchasing", body: "Search, due-diligence, negotiation, and closing — handled end-to-end." },
          { icon: ShieldCheck,title: "After-sale", body: "Refurbishment, fit-out, and ongoing care so your investment keeps appreciating." },
          { icon: Globe2,     title: "Diaspora desk", body: "Live virtual viewings, USD/GBP pricing, escrow-backed payments, independent legal verification." },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-xl border p-6">
            <div className="h-10 w-10 rounded-md bg-accent text-accent-foreground grid place-items-center"><Icon className="h-5 w-5" /></div>
            <div className="mt-4 font-semibold">{title}</div>
            <p className="mt-2 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>

      <section className="mt-16 rounded-xl border bg-card p-8 md:p-10">
        <h2 className="text-2xl md:text-3xl font-serif font-semibold">Why we exist</h2>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Too many Nigerians at home and abroad have been burned by opaque transactions, unverifiable titles, and absentee
          developers. We started Oaks &amp; Bims to be the partner we ourselves would want — disciplined, transparent, and
          relentlessly focused on protecting our clients&apos; capital.
        </p>
      </section>
    </div>
  );
}
