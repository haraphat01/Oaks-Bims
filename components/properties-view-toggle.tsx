"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { LayoutGrid, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/property-card";
import type { Property } from "@/lib/types";

const MapView = dynamic(
  () => import("@/components/map-view").then((m) => m.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full rounded-xl bg-muted animate-pulse" style={{ height: "calc(100vh - 280px)", minHeight: 500 }} />
    ),
  }
);

export function PropertiesViewToggle({ properties }: { properties: Property[] }) {
  const [view, setView] = useState<"grid" | "map">("grid");

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button
          variant={view === "grid" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("grid")}
        >
          <LayoutGrid className="h-4 w-4" />
          Grid
        </Button>
        <Button
          variant={view === "map" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("map")}
        >
          <Map className="h-4 w-4" />
          Map
        </Button>
      </div>

      {view === "grid" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
        </div>
      ) : (
        <MapView properties={properties} />
      )}
    </div>
  );
}
