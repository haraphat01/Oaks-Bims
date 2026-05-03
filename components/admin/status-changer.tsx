"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Select } from "@/components/ui/select";
import type { ListingStatus } from "@/lib/types";

const LABELS: Record<ListingStatus, string> = {
  draft: "Draft",
  available: "Available",
  under_offer: "Under Offer",
  sold: "Sold",
  rented: "Rented",
};

export function StatusChanger({ id, status }: { id: string; status: ListingStatus }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <Select
      value={status}
      disabled={pending}
      className="h-8 text-xs py-0 w-36"
      onChange={(e) => {
        const next = e.target.value as ListingStatus;
        start(async () => {
          const sb = createClient();
          await sb.from("properties").update({ status: next }).eq("id", id);
          router.refresh();
        });
      }}
    >
      {(Object.keys(LABELS) as ListingStatus[]).map((v) => (
        <option key={v} value={v}>{LABELS[v]}</option>
      ))}
    </Select>
  );
}
