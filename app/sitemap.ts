import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://oaksandbims.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();
  const { data: properties } = await supabase
    .from("properties")
    .select("slug, updated_at")
    .neq("status", "draft")
    .order("updated_at", { ascending: false });

  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                  lastModified: now, changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/properties`,  lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/contact`,     lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/about`,       lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  const propertyPages: MetadataRoute.Sitemap = (properties ?? []).map((p) => ({
    url: `${BASE}/properties/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...propertyPages];
}
