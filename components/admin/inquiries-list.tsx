"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { CheckCircle, Circle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToggleHandled } from "@/components/admin/toggle-handled";
import { createClient } from "@/lib/supabase/client";
import type { Inquiry } from "@/lib/types";

type InquiryRow = Inquiry & { properties: { slug: string; title: string } | null };

export function InquiriesList({ inquiries }: { inquiries: InquiryRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, start] = useTransition();
  const selectAllRef = useRef<HTMLInputElement>(null);

  const allChecked = inquiries.length > 0 && selected.size === inquiries.length;
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
    setSelected(allChecked ? new Set() : new Set(inquiries.map((q) => q.id)));
  }

  function bulkUpdate(is_handled: boolean) {
    start(async () => {
      const sb = createClient();
      await sb.from("inquiries").update({ is_handled }).in("id", [...selected]);
      setSelected(new Set());
      router.refresh();
    });
  }

  if (inquiries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
        No inquiries found.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
          <input
            ref={selectAllRef}
            type="checkbox"
            className="h-4 w-4 rounded"
            checked={allChecked}
            onChange={toggleAll}
          />
          Select all
        </label>
        {selected.size > 0 && (
          <>
            <span className="text-sm font-medium">{selected.size} selected</span>
            <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => bulkUpdate(true)}>
              <CheckCircle className="h-4 w-4" />
              Mark handled
            </Button>
            <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => bulkUpdate(false)}>
              <Circle className="h-4 w-4" />
              Mark open
            </Button>
          </>
        )}
      </div>

      {inquiries.map((q) => (
        <div
          key={q.id}
          className={`rounded-xl border bg-card p-5 transition-colors ${selected.has(q.id) ? "border-primary/40 bg-primary/5" : ""}`}
        >
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              className="h-4 w-4 rounded mt-0.5 shrink-0"
              checked={selected.has(q.id)}
              onChange={() => toggle(q.id)}
              aria-label={`Select inquiry from ${q.full_name}`}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{q.full_name}</div>
                  <div className="text-sm text-muted-foreground">
                    <a className="hover:text-primary" href={`mailto:${q.email}`}>{q.email}</a>
                    {q.phone ? ` · ${q.phone}` : ""}
                    {q.country ? ` · ${q.country}` : ""}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge variant={q.is_handled ? "success" : "warning"}>
                    {q.is_handled ? "Handled" : "Open"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(q.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
              {q.properties && (
                <div className="mt-2 text-xs">
                  Re:{" "}
                  <Link className="text-primary hover:underline" href={`/properties/${q.properties.slug}`}>
                    {q.properties.title}
                  </Link>
                </div>
              )}
              <p className="mt-3 text-sm whitespace-pre-line">{q.message}</p>
              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <ToggleHandled id={q.id} initial={q.is_handled} />
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/receipts/new?inquiry=${q.id}`}>Create receipt</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
