"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { Property } from "@/lib/types";

export function NewsletterSender({ properties }: { properties: Property[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [result, setResult] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((curr) =>
      curr.includes(id) ? curr.filter((x) => x !== id) : curr.length >= 10 ? curr : [...curr, id]
    );
  }

  async function send() {
    if (selected.length === 0) return;
    if (!confirm(`Send these ${selected.length} listings to all confirmed subscribers?`)) return;
    setStatus("sending");
    setResult(null);
    try {
      const res = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ property_ids: selected }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? "Send failed");
      setStatus("ok");
      setResult(`Sent to ${j.sent} of ${j.total} subscribers.`);
    } catch (err) {
      setStatus("error");
      setResult(err instanceof Error ? err.message : "Send failed");
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((p) => {
          const isOn = selected.includes(p.id);
          const cover = p.cover_image_url ?? p.image_urls[0] ?? null;
          return (
            <button
              type="button"
              key={p.id}
              onClick={() => toggle(p.id)}
              className={`text-left rounded-xl border p-3 transition ${isOn ? "border-primary ring-2 ring-primary/20" : "hover:border-primary/40"}`}
            >
              <div className="relative aspect-[4/3] rounded-md overflow-hidden bg-muted">
                {cover && <Image src={cover} alt="" fill className="object-cover" sizes="240px" />}
                {isOn && <div className="absolute top-2 right-2 rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5">SELECTED</div>}
              </div>
              <div className="mt-3 font-medium line-clamp-2 text-sm">{p.title}</div>
              <div className="text-xs text-muted-foreground">{p.city}, {p.state}</div>
            </button>
          );
        })}
      </div>

      <div className="sticky bottom-4 flex items-center justify-between rounded-xl border bg-card p-4 shadow">
        <div className="text-sm">
          {selected.length} / 10 selected
          {result && <div className="text-xs text-muted-foreground mt-0.5">{result}</div>}
        </div>
        <Button onClick={send} disabled={selected.length === 0 || status === "sending"}>
          {status === "sending" ? "Sending…" : "Send to subscribers"}
        </Button>
      </div>
    </div>
  );
}
