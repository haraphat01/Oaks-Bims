import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { AdminSearch } from "@/components/admin/admin-search";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminSelectFilter } from "@/components/admin/admin-select-filter";
import { PropertiesTable } from "@/components/admin/properties-table";
import type { Property, ListingStatus } from "@/lib/types";

const PAGE_SIZE = 25;

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "available", label: "Available" },
  { value: "under_offer", label: "Under Offer" },
  { value: "sold", label: "Sold" },
  { value: "rented", label: "Rented" },
];

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string; status?: string };
}) {
  const supabase = createClient();
  const q = typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const status = typeof searchParams.status === "string" ? searchParams.status : "";
  const page = Math.max(1, parseInt(typeof searchParams.page === "string" ? searchParams.page : "1", 10) || 1);

  let query = supabase
    .from("properties")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (q) query = query.or(`title.ilike.%${q}%,city.ilike.%${q}%,state.ilike.%${q}%`);
  if (status) query = query.eq("status", status as ListingStatus);

  const { data, count } = await query;
  const properties = (data ?? []) as Property[];
  const total = count ?? 0;

  const paginationParams = new URLSearchParams();
  if (q) paginationParams.set("q", q);
  if (status) paginationParams.set("status", status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-semibold">Properties</h1>
          <p className="text-muted-foreground mt-1">{total} listing{total === 1 ? "" : "s"}</p>
        </div>
        <Button asChild><Link href="/admin/properties/new">+ New property</Link></Button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <AdminSearch defaultValue={q} placeholder="Search by title, city, state…" />
        <AdminSelectFilter param="status" defaultValue={status} options={STATUS_OPTIONS} />
      </div>

      <PropertiesTable properties={properties} />

      <AdminPagination page={page} total={total} pageSize={PAGE_SIZE} paramsStr={paginationParams.toString()} />
    </div>
  );
}
