"use client";

import Image from "next/image";
import Link from "next/link";
import { X, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useComparison } from "@/components/comparison-provider";

export function ComparisonBar() {
  const { items, toggle, clear } = useComparison();
  if (items.length === 0) return null;

  const compareHref = `/compare?ids=${items.map((p) => p.id).join(",")}`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur shadow-lg">
      <div className="container flex items-center gap-3 py-2.5 pr-20">
        <span className="text-sm font-medium shrink-0 text-muted-foreground hidden sm:block">
          Compare ({items.length}/3)
        </span>

        {/* Selected property chips */}
        <div className="flex items-center gap-2 flex-1 overflow-x-auto min-w-0">
          {items.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-2 rounded-lg border bg-secondary/60 px-2.5 py-1.5 shrink-0"
            >
              {p.cover_image_url && (
                <div className="relative w-9 h-9 rounded overflow-hidden shrink-0">
                  <Image src={p.cover_image_url} alt="" fill className="object-cover" sizes="36px" />
                </div>
              )}
              <div className="min-w-0">
                <div className="text-xs font-medium truncate max-w-[110px]">{p.title}</div>
                <div className="text-[10px] text-muted-foreground">{p.city}</div>
              </div>
              <button
                onClick={() => toggle(p)}
                className="shrink-0 text-muted-foreground hover:text-destructive transition-colors ml-0.5"
                aria-label={`Remove ${p.title}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {/* Empty slot placeholders */}
          {Array.from({ length: 3 - items.length }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-dashed px-5 py-3 text-xs text-muted-foreground shrink-0"
            >
              + Add property
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {items.length >= 2 && (
            <Button asChild size="sm">
              <Link href={compareHref}>
                <ArrowRightLeft className="h-4 w-4" />
                Compare
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={clear} className="text-muted-foreground">
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
