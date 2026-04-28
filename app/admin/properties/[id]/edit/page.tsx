import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PropertyForm } from "@/components/admin/property-form";
import type { Property } from "@/lib/types";

export default async function EditPropertyPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", params.id)
    .single();
  if (error || !data) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-semibold">Edit property</h1>
      <PropertyForm mode="edit" initial={data as Property} />
    </div>
  );
}
