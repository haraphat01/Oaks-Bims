import { createClient } from "@/lib/supabase/server";
import { ReceiptForm } from "@/components/admin/receipt-form";
import type { Inquiry, Property } from "@/lib/types";

export const metadata = { title: "New receipt" };

export default async function NewReceiptPage({
  searchParams,
}: {
  searchParams: { inquiry?: string };
}) {
  const supabase = createClient();

  const [propsRes, inqRes] = await Promise.all([
    supabase
      .from("properties")
      .select("id,title,city,state")
      .eq("status", "available")
      .order("created_at", { ascending: false }),
    supabase
      .from("inquiries")
      .select("id,full_name,email,phone,property_id,properties(title)")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const properties = (propsRes.data ?? []) as Pick<Property, "id" | "title" | "city" | "state">[];
  const inquiries = (inqRes.data ?? []).map((q: any) => ({
    ...q,
    properties: Array.isArray(q.properties) ? (q.properties[0] ?? null) : q.properties,
  })) as (Pick<Inquiry, "id" | "full_name" | "email" | "phone" | "property_id"> & {
    properties: { title: string } | null;
  })[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-serif font-semibold">New receipt</h1>
        <p className="text-muted-foreground mt-1">Generate a payment receipt for a buyer.</p>
      </div>
      <ReceiptForm
        properties={properties}
        inquiries={inquiries}
        defaultInquiryId={searchParams.inquiry}
      />
    </div>
  );
}
