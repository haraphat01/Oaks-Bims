"use client";

import { useEffect } from "react";
import { addRecentlyViewed, type RecentlyViewedProperty } from "@/lib/recently-viewed";

export function RecentlyViewedTracker({ property }: { property: RecentlyViewedProperty }) {
  useEffect(() => {
    addRecentlyViewed(property);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property.slug]);
  return null;
}
