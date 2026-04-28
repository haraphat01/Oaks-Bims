"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { NIGERIA_STATES } from "@/lib/nigeria-states";
import { PROPERTY_TYPES, PROPERTY_TYPE_LABEL } from "@/lib/types";

export function PropertyFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, start] = useTransition();

  function update(form: FormData) {
    const next = new URLSearchParams();
    for (const [k, v] of form.entries()) {
      const s = String(v).trim();
      if (s) next.set(k, s);
    }
    start(() => {
      router.push(`/properties${next.toString() ? `?${next}` : ""}`);
    });
  }

  return (
    <form
      action={update}
      className="rounded-xl border bg-card p-4 md:p-6 grid gap-3 sm:grid-cols-2 md:grid-cols-12 md:items-end"
    >
      <div className="sm:col-span-2 md:col-span-3">
        <Label htmlFor="q">Search</Label>
        <Input id="q" name="q" placeholder="Lekki, duplex, Banana Island…" defaultValue={params.get("q") ?? ""} />
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="purpose">Purpose</Label>
        <Select id="purpose" name="purpose" defaultValue={params.get("purpose") ?? ""}>
          <option value="">Any</option>
          <option value="sale">For sale</option>
          <option value="rent">For rent</option>
          <option value="shortlet">Shortlet</option>
        </Select>
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="state">State</Label>
        <Select id="state" name="state" defaultValue={params.get("state") ?? ""}>
          <option value="">All states</option>
          {NIGERIA_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="property_type">Type</Label>
        <Select id="property_type" name="property_type" defaultValue={params.get("property_type") ?? ""}>
          <option value="">Any type</option>
          {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{PROPERTY_TYPE_LABEL[t]}</option>)}
        </Select>
      </div>
      <div className="md:col-span-1">
        <Label htmlFor="bedrooms">Beds</Label>
        <Select id="bedrooms" name="bedrooms" defaultValue={params.get("bedrooms") ?? ""}>
          <option value="">Any</option>
          {[1,2,3,4,5,6].map((n) => <option key={n} value={String(n)}>{n}+</option>)}
        </Select>
      </div>
      <div className="sm:col-span-2 md:col-span-2">
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Searching…" : "Apply filters"}
        </Button>
      </div>
    </form>
  );
}
