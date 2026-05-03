import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BedDouble, Bath, Maximize2, MapPin, Calendar, Car, Home, Tag, Calculator } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PriceDisplay } from "@/components/price-display";
import { InquiryForm } from "@/components/inquiry-form";
import { FavoriteButton } from "@/components/favorite-button";
import { CompareButton } from "@/components/compare-button";
import { MortgageCalculator } from "@/components/mortgage-calculator";
import { ShareButtons } from "@/components/share-buttons";
import { RecentlyViewedTracker } from "@/components/recently-viewed-tracker";
import { RecentlyViewed } from "@/components/recently-viewed";
import { VideoEmbed } from "@/components/video-embed";
import { PROPERTY_TYPE_LABEL, type Property } from "@/lib/types";

export const revalidate = 60;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props) {
  const supabase = createClient();
  const { data } = await supabase
    .from("properties")
    .select("title,description,cover_image_url,city,state,price_ngn,purpose")
    .eq("slug", params.slug)
    .single();
  if (!data) return { title: "Property not found" };

  const purposeLabel = data.purpose === "rent" ? "for rent" : data.purpose === "shortlet" ? "shortlet" : "for sale";
  const locationLabel = [data.city, data.state, "Nigeria"].filter(Boolean).join(", ");

  return {
    title: `${data.title} — ${locationLabel}`,
    description: `${data.title} ${purposeLabel} in ${locationLabel}. ${data.description.slice(0, 120)}`,
    openGraph: {
      title: `${data.title} — Oaks & Bims Nigeria`,
      description: `${data.title} ${purposeLabel} in ${locationLabel}.`,
      images: data.cover_image_url ? [{ url: data.cover_image_url, width: 1200, height: 800 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${data.title} — Oaks & Bims Nigeria`,
      images: data.cover_image_url ? [data.cover_image_url] : [],
    },
  };
}

export default async function PropertyDetailPage({ params }: Props) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (error || !data) notFound();
  const p = data as Property;

  const { data: { user } } = await supabase.auth.getUser();
  let isFav = false;
  if (user) {
    const { data: f } = await supabase
      .from("favorites")
      .select("user_id")
      .eq("user_id", user.id)
      .eq("property_id", p.id)
      .maybeSingle();
    isFav = !!f;
  }

  const cover = p.cover_image_url || p.image_urls[0] || null;
  const gallery = p.image_urls.length > 0 ? p.image_urls : cover ? [cover] : [];

  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://oaksandbims.com";
  const listingSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: p.title,
    description: p.description,
    url: `${base}/properties/${p.slug}`,
    image: gallery,
    datePosted: p.published_at ?? p.created_at,
    offers: {
      "@type": "Offer",
      price: p.price_ngn,
      priceCurrency: "NGN",
      availability: "https://schema.org/InStock",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: p.address ?? undefined,
      addressLocality: p.city,
      addressRegion: p.state,
      addressCountry: "NG",
    },
    numberOfRooms: p.bedrooms > 0 ? p.bedrooms : undefined,
    floorSize: p.area_sqm
      ? { "@type": "QuantitativeValue", value: p.area_sqm, unitCode: "MTK" }
      : undefined,
    amenityFeature: p.features.map((f) => ({ "@type": "LocationFeatureSpecification", name: f, value: true })),
  };

  return (
    <div className="container py-10 md:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listingSchema) }}
      />
      <RecentlyViewedTracker
        property={{
          slug: p.slug,
          title: p.title,
          cover_image_url: p.cover_image_url,
          price_ngn: p.price_ngn,
          city: p.city,
          state: p.state,
          purpose: p.purpose,
        }}
      />

      {/* Header */}
      <div className="mb-6 space-y-3">
        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge className="capitalize">{p.purpose}</Badge>
          <Badge variant="outline" className="capitalize">{PROPERTY_TYPE_LABEL[p.property_type]}</Badge>
          {p.is_featured && <Badge variant="warning">Featured</Badge>}
        </div>

        {/* Title + price/favorite — stay on one row, price shrinks to right */}
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold flex-1 min-w-0">
            {p.title}
          </h1>
          <div className="flex items-start gap-3 shrink-0">
            <div className="text-right">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
                <PriceDisplay ngn={p.price_ngn} />
              </div>
              {p.purpose === "rent" && <div className="text-xs text-muted-foreground">per year</div>}
              {p.purpose === "shortlet" && <div className="text-xs text-muted-foreground">per night</div>}
            </div>
            <FavoriteButton propertyId={p.id} initial={isFav} loggedIn={!!user} />
            <CompareButton property={p} />
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
          <MapPin className="h-4 w-4 shrink-0" />
          <span>{[p.address, p.city, p.state].filter(Boolean).join(", ")}</span>
        </div>

        {/* Share */}
        <ShareButtons title={p.title} path={`/properties/${p.slug}`} />
      </div>

      {/* Gallery */}
      {gallery.length > 0 && (
        <div className="grid gap-2 md:grid-cols-4 md:grid-rows-2 rounded-xl overflow-hidden">
          <div className="relative md:col-span-2 md:row-span-2 aspect-[4/3] md:aspect-auto bg-muted">
            <Image src={gallery[0]} alt={p.title} fill className="object-cover" sizes="(max-width:768px) 100vw, 50vw" priority />
          </div>
          {gallery.slice(1, 5).map((src, i) => (
            <div key={i} className="relative hidden md:block aspect-square bg-muted">
              <Image src={src} alt="" fill className="object-cover" sizes="25vw" />
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8 lg:gap-10 mt-8 lg:mt-10">
        {/* Main */}
        <div className="lg:col-span-2 space-y-8 lg:space-y-10">
          <section>
            <h2 className="text-2xl font-serif font-semibold">About this property</h2>
            <p className="mt-3 text-muted-foreground leading-relaxed whitespace-pre-line">{p.description}</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold">Quick facts</h2>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {p.bedrooms > 0 && <Fact icon={BedDouble} label="Bedrooms" value={p.bedrooms} />}
              {p.bathrooms > 0 && <Fact icon={Bath} label="Bathrooms" value={p.bathrooms} />}
              {p.area_sqm && <Fact icon={Maximize2} label="Floor area" value={`${p.area_sqm} sqm`} />}
              {p.plot_size_sqm && <Fact icon={Home} label="Plot size" value={`${p.plot_size_sqm} sqm`} />}
              {p.parking_spaces > 0 && <Fact icon={Car} label="Parking" value={p.parking_spaces} />}
              {p.year_built && <Fact icon={Calendar} label="Year built" value={p.year_built} />}
            </div>
          </section>

          {p.features.length > 0 && (
            <section>
              <h2 className="text-2xl font-serif font-semibold">Features</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {p.features.map((f) => (
                  <Badge key={f} variant="outline" className="text-sm py-1.5 px-3">
                    <Tag className="h-3.5 w-3.5 mr-1.5" /> {f}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {p.amenities.length > 0 && (
            <section>
              <h2 className="text-2xl font-serif font-semibold">Amenities</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {p.amenities.map((a) => <Badge key={a} variant="secondary" className="text-sm py-1.5 px-3">{a}</Badge>)}
              </div>
            </section>
          )}

          {p.video_urls && p.video_urls.length > 0 && (
            <section>
              <h2 className="text-2xl font-serif font-semibold">Video tour</h2>
              <div className="mt-4 space-y-4">
                {p.video_urls.map((url) => (
                  <VideoEmbed key={url} url={url} title={p.title} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar — inquiry form */}
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 rounded-xl border bg-card p-5 md:p-6">
            <div className="font-semibold text-lg">Interested in this property?</div>
            <p className="text-sm text-muted-foreground mt-1">
              Send a message and we&apos;ll be in touch within 24 hours, in your time zone.
            </p>
            <div className="mt-4">
              <InquiryForm propertyId={p.id} propertyTitle={p.title} />
            </div>
          </div>
        </aside>
      </div>

      {/* Mortgage calculator — only for sale properties */}
      {p.purpose === "sale" && (
        <div className="mt-10 md:mt-12">
          <MortgageCalculator defaultPrice={p.price_ngn} />
        </div>
      )}

      {p.purpose !== "sale" && (
        <div className="mt-8 rounded-xl border bg-card/60 p-5 flex items-center justify-between gap-4">
          <div>
            <div className="font-medium">Thinking of buying instead?</div>
            <div className="text-sm text-muted-foreground mt-0.5">Estimate your mortgage repayments with our calculator.</div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/mortgage-calculator?price=${p.price_ngn}`}>
              <Calculator className="h-4 w-4" />
              Calculator
            </Link>
          </Button>
        </div>
      )}

      <RecentlyViewed excludeSlug={p.slug} />
    </div>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <div className="mt-2 font-semibold">{value}</div>
    </div>
  );
}
