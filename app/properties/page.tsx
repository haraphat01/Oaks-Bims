import { Suspense } from "react";
import { PropertyFilters } from "@/components/property-filters";
import { SaveSearchButton } from "@/components/save-search-button";
import { PropertiesViewToggle } from "@/components/properties-view-toggle";
import { createClient } from "@/lib/supabase/server";
import type { ListingPurpose, Property, PropertyType } from "@/lib/types";

export const revalidate = 30;

type SearchParams = Record<string, string | string[] | undefined>;

function singleParam(p: string | string[] | undefined): string | undefined {
  if (Array.isArray(p)) return p[0];
  return p;
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Check if the user already saved this exact search
  let savedId: string | null = null;
  if (user) {
    const filters: Record<string, string> = {};
    for (const k of ["q", "purpose", "state", "property_type", "bedrooms"]) {
      const v = singleParam(searchParams[k]);
      if (v) filters[k] = v;
    }
    if (Object.keys(filters).length > 0) {
      const { data: existing } = await supabase
        .from("saved_searches")
        .select("id, filters")
        .eq("user_id", user.id);
      const match = (existing ?? []).find(
        (s) => JSON.stringify(s.filters) === JSON.stringify(filters)
      );
      savedId = match?.id ?? null;
    }
  }

  const q = singleParam(searchParams.q);
  const purpose = singleParam(searchParams.purpose) as ListingPurpose | undefined;
  const state = singleParam(searchParams.state);
  const propertyType = singleParam(searchParams.property_type) as PropertyType | undefined;
  const bedrooms = singleParam(searchParams.bedrooms);

  let query = supabase
    .from("properties")
    .select("*", { count: "exact" })
    .eq("status", "available")
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(60);

  if (purpose) query = query.eq("purpose", purpose);
  if (state) query = query.eq("state", state);
  if (propertyType) query = query.eq("property_type", propertyType);
  if (bedrooms) query = query.gte("bedrooms", Number(bedrooms));
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,city.ilike.%${q}%`);

  const { data, count } = await query;
  const properties = (data ?? []) as Property[];

  return (
    <div className="container py-10 md:py-14 space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-serif font-semibold">Properties</h1>
        <p className="text-muted-foreground mt-1">
          {count ?? properties.length} listing{(count ?? properties.length) === 1 ? "" : "s"} matching your filters
        </p>
      </div>

      <div>
        <Suspense fallback={null}>
          <PropertyFilters />
        </Suspense>
        <div className="flex justify-end mt-3">
          <Suspense fallback={null}>
            <SaveSearchButton
              userEmail={user?.email ?? null}
              savedId={savedId}
            />
          </Suspense>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="rounded-xl border border-dashed p-16 text-center">
          <div className="text-lg font-medium">No properties match these filters yet.</div>
          <p className="text-sm text-muted-foreground mt-2">
            Try widening your search, or check back soon — we add new listings every week.
          </p>
        </div>
      ) : (
        <PropertiesViewToggle properties={properties} />
      )}
    </div>
  );
}
