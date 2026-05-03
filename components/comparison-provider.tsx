"use client";

import * as React from "react";
import type { Property } from "@/lib/types";

const MAX = 3;
const STORAGE_KEY = "oaks-compare";

type ComparisonCtx = {
  items: Property[];
  toggle: (p: Property) => void;
  isAdded: (id: string) => boolean;
  isFull: boolean;
  clear: () => void;
};

const ComparisonContext = React.createContext<ComparisonCtx | null>(null);

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<Property[]>([]);

  // Hydrate from localStorage once on mount
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  function persist(next: Property[]) {
    setItems(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  }

  function toggle(p: Property) {
    setItems((prev) => {
      const exists = prev.some((x) => x.id === p.id);
      const next = exists
        ? prev.filter((x) => x.id !== p.id)
        : prev.length < MAX ? [...prev, p] : prev;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function isAdded(id: string) { return items.some((x) => x.id === id); }
  function clear() { persist([]); }

  return (
    <ComparisonContext.Provider value={{ items, toggle, isAdded, isFull: items.length >= MAX, clear }}>
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const ctx = React.useContext(ComparisonContext);
  if (!ctx) throw new Error("useComparison must be inside ComparisonProvider");
  return ctx;
}
