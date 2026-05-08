import { createClient } from "@/lib/supabase/server";
import { AdminSearch } from "@/components/admin/admin-search";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminSelectFilter } from "@/components/admin/admin-select-filter";
import { InquiriesList } from "@/components/admin/inquiries-list";
import type { Inquiry } from "@/lib/types";

const PAGE_SIZE = 20;

const HANDLED_OPTIONS = [
  { value: "", label: "All inquiries" },
  { value: "open", label: "Open" },
  { value: "handled", label: "Handled" },
];

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string; handled?: string };
}) {
  const supabase = createClient();
  const q = typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const handled = typeof searchParams.handled === "string" ? searchParams.handled : "";
  const page = Math.max(1, parseInt(typeof searchParams.page === "string" ? searchParams.page : "1", 10) || 1);

  let query = supabase
    .from("inquiries")
    .select("*, properties(slug,title)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  if (q) query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
  if (handled === "open") query = query.eq("is_handled", false);
  if (handled === "handled") query = query.eq("is_handled", true);

  const { data, count } = await query;
  const inquiries = (data ?? []) as (Inquiry & { properties: { slug: string; title: string } | null })[];
  const total = count ?? 0;

  const paginationParams = new URLSearchParams();
  if (q) paginationParams.set("q", q);
  if (handled) paginationParams.set("handled", handled);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-semibold">Inquiries</h1>
        <p className="text-muted-foreground mt-1">{total} message{total === 1 ? "" : "s"}</p>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <AdminSearch defaultValue={q} placeholder="Search by name or email…" />
        <AdminSelectFilter param="handled" defaultValue={handled} options={HANDLED_OPTIONS} />
      </div>

      <InquiriesList inquiries={inquiries} />

      <AdminPagination page={page} total={total} pageSize={PAGE_SIZE} paramsStr={paginationParams.toString()} />
    </div>
  );
}
