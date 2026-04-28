import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Property } from "@/lib/types";

export default async function AdminPropertiesPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false });
  const properties = (data ?? []) as Property[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-semibold">Properties</h1>
          <p className="text-muted-foreground mt-1">{properties.length} listing{properties.length === 1 ? "" : "s"}</p>
        </div>
        <Button asChild><Link href="/admin/properties/new">+ New property</Link></Button>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3 w-16"></th>
              <th className="p-3">Title</th>
              <th className="p-3">Location</th>
              <th className="p-3">Price (₦)</th>
              <th className="p-3">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-2">
                  <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted">
                    {p.cover_image_url && <Image src={p.cover_image_url} alt="" fill className="object-cover" sizes="48px" />}
                  </div>
                </td>
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3 text-muted-foreground">{p.city}, {p.state}</td>
                <td className="p-3 font-mono">{Number(p.price_ngn).toLocaleString()}</td>
                <td className="p-3"><Badge variant={p.status === "available" ? "success" : "secondary"} className="capitalize">{p.status.replace("_"," ")}</Badge></td>
                <td className="p-3 text-right space-x-2">
                  <Link href={`/properties/${p.slug}`} className="text-muted-foreground hover:text-primary text-xs">View</Link>
                  <Link href={`/admin/properties/${p.id}/edit`} className="text-primary text-xs hover:underline">Edit</Link>
                </td>
              </tr>
            ))}
            {properties.length === 0 && (
              <tr><td className="p-10 text-center text-muted-foreground" colSpan={6}>
                No properties yet. <Link className="text-primary hover:underline" href="/admin/properties/new">Create the first one</Link>.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
