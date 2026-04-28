"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "saving" | "saved" | "removing" | "error";

export function SaveSearchButton({
  userEmail,
  savedId,
}: {
  userEmail: string | null;
  savedId: string | null;
}) {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<Status>("idle");
  const [currentSavedId, setCurrentSavedId] = useState<string | null>(savedId);

  const hasFilters = ["q", "purpose", "state", "property_type", "bedrooms"].some(
    (k) => searchParams.get(k)
  );

  if (!hasFilters) return null;

  async function save() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = `/login?next=/properties?${searchParams.toString()}`;
      return;
    }

    setStatus("saving");
    const filters: Record<string, string> = {};
    for (const k of ["q", "purpose", "state", "property_type", "bedrooms"]) {
      const v = searchParams.get(k);
      if (v) filters[k] = v;
    }

    const res = await fetch("/api/saved-searches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filters,
        email: user.email,
        label: buildLabel(filters),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setCurrentSavedId(data.id);
      setStatus("saved");
    } else {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  async function remove() {
    if (!currentSavedId) return;
    setStatus("removing");
    const res = await fetch(`/api/saved-searches/${currentSavedId}`, { method: "DELETE" });
    if (res.ok) {
      setCurrentSavedId(null);
      setStatus("idle");
    } else {
      setStatus("error");
      setTimeout(() => setStatus("saved"), 3000);
    }
  }

  const isBusy = status === "saving" || status === "removing";
  const isSaved = status === "saved" || (currentSavedId !== null && status === "idle");

  return (
    <Button
      variant={isSaved ? "secondary" : "outline"}
      size="sm"
      className="gap-1.5 shrink-0"
      onClick={isSaved ? remove : save}
      disabled={isBusy}
    >
      {isBusy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : isSaved ? (
        <BellOff className="h-3.5 w-3.5" />
      ) : (
        <Bell className="h-3.5 w-3.5" />
      )}
      {isBusy
        ? "…"
        : isSaved
        ? "Alert on"
        : "Alert me"}
    </Button>
  );
}

function buildLabel(filters: Record<string, string>): string {
  const parts: string[] = [];
  if (filters.purpose) parts.push(filters.purpose);
  if (filters.state) parts.push(filters.state);
  if (filters.property_type) parts.push(filters.property_type.replace(/_/g, " "));
  if (filters.bedrooms) parts.push(`${filters.bedrooms}+ bed`);
  if (filters.q) parts.push(`"${filters.q}"`);
  return parts.length > 0 ? parts.join(", ") : "Custom search";
}
