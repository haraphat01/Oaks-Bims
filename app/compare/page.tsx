import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, BedDouble, Bath, Maximize2, Home, Car, Calendar, MapPin, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "@/components/price-display";
import { PROPERTY_TYPE_LABEL, type Property } from "@/lib/types";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Compare Properties" };

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="border-t">
      <td className="py-3 pr-4 text-sm text-muted-foreground font-medium align-top whitespace-nowrap w-36 shrink-0">
        {label}
      </td>
      {children}
    </tr>
  );
}

function Cell({ children }: { children: React.ReactNode }) {
  return (
    <td className="py-3 px-3 text-sm align-top border-l">
      {children ?? <span className="text-muted-foreground">—</span>}
    </td>
  );
}

function TagList({ items }: { items: string[] }) {
  if (!items.length) return <span className="text-muted-foreground text-sm">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((t) => (
        <span key={t} className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium">
          {t}
        </span>
      ))}
    </div>
  );
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: { ids?: string };
}) {
  const rawIds = typeof searchParams.ids === "string" ? searchParams.ids : "";
  const ids = rawIds.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 3);

  if (ids.length === 0) {
    return (
      <div className="container py-16 text-center space-y-4">
        <h1 className="text-3xl font-serif font-semibold">Compare Properties</h1>
        <p className="text-muted-foreground">
          You haven&apos;t selected any properties to compare yet.
        </p>
        <Button asChild>
          <Link href="/properties">Browse properties</Link>
        </Button>
      </div>
    );
  }

  const supabase = createClient();
  const { data } = await supabase.from("properties").select("*").in("id", ids);
  const properties = (data ?? []) as Property[];

  if (properties.length === 0) {
    return (
      <div className="container py-16 text-center space-y-4">
        <h1 className="text-3xl font-serif font-semibold">Compare Properties</h1>
        <p className="text-muted-foreground">None of the selected properties were found.</p>
        <Button asChild><Link href="/properties">Browse properties</Link></Button>
      </div>
    );
  }

  return (
    <div className="container py-10 md:py-14">
      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="ghost" size="sm">
          <Link href="/properties">
            <ArrowLeft className="h-4 w-4" /> Back to properties
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-serif font-semibold">Comparing {properties.length} properties</h1>
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="min-w-[640px] px-4 sm:px-0">
          <table className="w-full">
            <thead>
              <tr>
                <th className="w-36" />
                {properties.map((p) => (
                  <th key={p.id} className="pb-4 px-3 border-l align-top">
                    {/* Cover image */}
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted mb-3">
                      {p.cover_image_url ? (
                        <Image
                          src={p.cover_image_url}
                          alt={p.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-xs">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-base leading-snug">{p.title}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        {p.city}, {p.state}
                      </div>
                      <div className="text-primary font-bold text-lg mt-2">
                        <PriceDisplay ngn={p.price_ngn} />
                      </div>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <Badge className="capitalize text-xs">{p.purpose}</Badge>
                        <Badge variant={p.status === "available" ? "success" : "secondary"} className="capitalize text-xs">
                          {p.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <Link
                        href={`/properties/${p.slug}`}
                        className="inline-block mt-3 text-xs text-primary hover:underline"
                      >
                        View full listing →
                      </Link>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* Specs */}
              <tr className="bg-muted/40">
                <td colSpan={properties.length + 1} className="py-2 px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Specifications
                </td>
              </tr>

              <Row label="Type">
                {properties.map((p) => (
                  <Cell key={p.id}>{PROPERTY_TYPE_LABEL[p.property_type]}</Cell>
                ))}
              </Row>
              <Row label="Bedrooms">
                {properties.map((p) => (
                  <Cell key={p.id}>
                    {p.bedrooms > 0 ? (
                      <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5 text-muted-foreground" />{p.bedrooms}</span>
                    ) : null}
                  </Cell>
                ))}
              </Row>
              <Row label="Bathrooms">
                {properties.map((p) => (
                  <Cell key={p.id}>
                    {p.bathrooms > 0 ? (
                      <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5 text-muted-foreground" />{p.bathrooms}</span>
                    ) : null}
                  </Cell>
                ))}
              </Row>
              <Row label="Floor area">
                {properties.map((p) => (
                  <Cell key={p.id}>
                    {p.area_sqm ? (
                      <span className="flex items-center gap-1"><Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />{p.area_sqm} sqm</span>
                    ) : null}
                  </Cell>
                ))}
              </Row>
              <Row label="Plot size">
                {properties.map((p) => (
                  <Cell key={p.id}>
                    {p.plot_size_sqm ? (
                      <span className="flex items-center gap-1"><Home className="h-3.5 w-3.5 text-muted-foreground" />{p.plot_size_sqm} sqm</span>
                    ) : null}
                  </Cell>
                ))}
              </Row>
              <Row label="Parking">
                {properties.map((p) => (
                  <Cell key={p.id}>
                    {p.parking_spaces > 0 ? (
                      <span className="flex items-center gap-1"><Car className="h-3.5 w-3.5 text-muted-foreground" />{p.parking_spaces}</span>
                    ) : null}
                  </Cell>
                ))}
              </Row>
              <Row label="Year built">
                {properties.map((p) => (
                  <Cell key={p.id}>
                    {p.year_built ? (
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-muted-foreground" />{p.year_built}</span>
                    ) : null}
                  </Cell>
                ))}
              </Row>

              {/* Features / Amenities */}
              <tr className="bg-muted/40">
                <td colSpan={properties.length + 1} className="py-2 px-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Features &amp; Amenities
                </td>
              </tr>

              <Row label="Features">
                {properties.map((p) => (
                  <Cell key={p.id}><TagList items={p.features} /></Cell>
                ))}
              </Row>
              <Row label="Amenities">
                {properties.map((p) => (
                  <Cell key={p.id}><TagList items={p.amenities} /></Cell>
                ))}
              </Row>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
