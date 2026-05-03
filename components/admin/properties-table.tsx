"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, CheckSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StatusChanger } from "@/components/admin/status-changer";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { createClient } from "@/lib/supabase/client";
import type { Property } from "@/lib/types";

export function PropertiesTable({ properties }: { properties: Property[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, start] = useTransition();
  const selectAllRef = useRef<HTMLInputElement>(null);

  const allChecked = properties.length > 0 && selected.size === properties.length;
  const someChecked = selected.size > 0 && !allChecked;

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someChecked;
  }, [someChecked]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allChecked ? new Set() : new Set(properties.map((p) => p.id)));
  }

  function bulkPublish() {
    start(async () => {
      const sb = createClient();
      await sb.from("properties").update({ status: "available" }).in("id", [...selected]);
      setSelected(new Set());
      router.refresh();
    });
  }

  function bulkDelete() {
    start(async () => {
      const sb = createClient();
      await sb.from("properties").delete().in("id", [...selected]);
      setSelected(new Set());
      setConfirmDelete(false);
      router.refresh();
    });
  }

  return (
    <>
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-secondary/50 px-4 py-2.5 text-sm">
          <span className="font-medium">{selected.size} selected</span>
          <div className="flex-1" />
          <Button type="button" variant="outline" size="sm" disabled={pending} onClick={bulkPublish}>
            <CheckSquare className="h-4 w-4" />
            Publish
          </Button>
          <Button type="button" variant="destructive" size="sm" disabled={pending} onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      )}

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3 w-10">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  className="h-4 w-4 rounded"
                  checked={allChecked}
                  onChange={toggleAll}
                  aria-label="Select all"
                />
              </th>
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
              <tr key={p.id} className={`border-t transition-colors ${selected.has(p.id) ? "bg-primary/5" : "hover:bg-muted/30"}`}>
                <td className="p-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded"
                    checked={selected.has(p.id)}
                    onChange={() => toggle(p.id)}
                    aria-label={`Select ${p.title}`}
                  />
                </td>
                <td className="p-2">
                  <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted">
                    {p.cover_image_url && (
                      <Image src={p.cover_image_url} alt="" fill className="object-cover" sizes="48px" />
                    )}
                  </div>
                </td>
                <td className="p-3 font-medium max-w-[200px] truncate">{p.title}</td>
                <td className="p-3 text-muted-foreground">{p.city}, {p.state}</td>
                <td className="p-3 font-mono">{Number(p.price_ngn).toLocaleString()}</td>
                <td className="p-3">
                  <StatusChanger id={p.id} status={p.status} />
                </td>
                <td className="p-3 text-right space-x-2 whitespace-nowrap">
                  <Link href={`/properties/${p.slug}`} className="text-muted-foreground hover:text-primary text-xs">View</Link>
                  <Link href={`/admin/properties/${p.id}/edit`} className="text-primary text-xs hover:underline">Edit</Link>
                </td>
              </tr>
            ))}
            {properties.length === 0 && (
              <tr>
                <td className="p-10 text-center text-muted-foreground" colSpan={7}>
                  No properties found.{" "}
                  <Link className="text-primary hover:underline" href="/admin/properties/new">Create the first one</Link>.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete properties"
        description={`Permanently delete ${selected.size} propert${selected.size === 1 ? "y" : "ies"}? This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={bulkDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
