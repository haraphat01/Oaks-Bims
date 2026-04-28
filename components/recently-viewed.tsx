"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { getRecentlyViewed, type RecentlyViewedProperty } from "@/lib/recently-viewed";
import { PriceDisplay } from "@/components/price-display";

export function RecentlyViewed({ excludeSlug }: { excludeSlug?: string }) {
  const [items, setItems] = useState<RecentlyViewedProperty[]>([]);

  useEffect(() => {
    const all = getRecentlyViewed();
    setItems(excludeSlug ? all.filter((r) => r.slug !== excludeSlug) : all);
  }, [excludeSlug]);

  if (items.length === 0) return null;

  return (
    <section className="mt-12 border-t pt-10">
      <h2 className="text-2xl font-serif font-semibold mb-5">Recently viewed</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <Link
            key={p.slug}
            href={`/properties/${p.slug}`}
            className="group flex gap-3 rounded-xl border bg-card p-3 hover:shadow-md transition-shadow"
          >
            <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
              {p.cover_image_url ? (
                <Image
                  src={p.cover_image_url}
                  alt={p.title}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-muted" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                {p.title}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" />
                {p.city}, {p.state}
              </div>
              <div className="text-sm font-bold text-primary mt-1">
                <PriceDisplay ngn={p.price_ngn} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
