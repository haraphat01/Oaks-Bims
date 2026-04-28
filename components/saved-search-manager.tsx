"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

type SavedSearch = {
  id: string;
  label: string | null;
  filters: Record<string, string>;
  email: string;
  last_notified_at: string | null;
  created_at: string;
};

export function SavedSearchManager({ initialSearches }: { initialSearches: SavedSearch[] }) {
  const [searches, setSearches] = useState<SavedSearch[]>(initialSearches);

  async function remove(id: string) {
    const res = await fetch(`/api/saved-searches/${id}`, { method: "DELETE" });
    if (res.ok) setSearches((prev) => prev.filter((s) => s.id !== id));
  }

  if (searches.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        No search alerts yet.{" "}
        <Link href="/properties" className="text-primary hover:underline">
          Browse properties
        </Link>{" "}
        and use the{" "}
        <span className="inline-flex items-center gap-0.5 font-medium">
          <Bell className="h-3 w-3" /> Alert me
        </span>{" "}
        button to save a search.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {searches.map((s) => {
        const qs = new URLSearchParams(s.filters).toString();
        const filterParts = Object.entries(s.filters).map(
          ([k, v]) => `${k.replace(/_/g, " ")}: ${v}`
        );
        return (
          <div key={s.id} className="flex items-center justify-between gap-4 rounded-xl border bg-card p-4">
            <div className="flex items-center gap-3 min-w-0">
              <Bell className="h-4 w-4 text-primary shrink-0" />
              <div className="min-w-0">
                <div className="font-medium text-sm truncate">{s.label || "Custom search"}</div>
                <div className="text-xs text-muted-foreground mt-0.5 truncate">
                  {filterParts.join(" · ")}
                </div>
                {s.last_notified_at && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Last alert: {new Date(s.last_notified_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/properties?${qs}`}>
                <Button size="sm" variant="outline" className="gap-1.5 h-8">
                  <Search className="h-3.5 w-3.5" />
                  View
                </Button>
              </Link>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                onClick={() => remove(s.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
