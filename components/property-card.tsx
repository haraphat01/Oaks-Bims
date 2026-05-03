import Image from "next/image";
import Link from "next/link";
import { BedDouble, Bath, Maximize2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "@/components/price-display";
import { CompareButton } from "@/components/compare-button";
import { PROPERTY_TYPE_LABEL, type Property } from "@/lib/types";

export function PropertyCard({ property }: { property: Property }) {
  const cover =
    property.cover_image_url ||
    property.image_urls[0] ||
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80";

  return (
    <Link
      href={`/properties/${property.slug}`}
      className="group block rounded-xl overflow-hidden border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <Image
          src={cover}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="default" className="capitalize">{property.purpose}</Badge>
          {property.is_featured && <Badge variant="warning">Featured</Badge>}
        </div>
        <div className="absolute top-2 right-2">
          <CompareButton property={property} compact />
        </div>
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-semibold text-base line-clamp-2 group-hover:text-primary transition-colors">
            {property.title}
          </h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>{property.city}, {property.state}</span>
        </div>
        <div className="text-lg font-bold text-primary">
          <PriceDisplay ngn={property.price_ngn} />
          {property.purpose === "rent" && <span className="text-xs text-muted-foreground font-normal"> /year</span>}
          {property.purpose === "shortlet" && <span className="text-xs text-muted-foreground font-normal"> /night</span>}
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
          {property.bedrooms > 0 && (
            <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" /> {property.bedrooms} bd</span>
          )}
          {property.bathrooms > 0 && (
            <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {property.bathrooms} ba</span>
          )}
          {property.area_sqm && (
            <span className="flex items-center gap-1"><Maximize2 className="h-3.5 w-3.5" /> {property.area_sqm} sqm</span>
          )}
          <span className="ml-auto text-[10px] uppercase tracking-wide">{PROPERTY_TYPE_LABEL[property.property_type]}</span>
        </div>
      </div>
    </Link>
  );
}
