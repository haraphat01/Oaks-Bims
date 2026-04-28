export type RecentlyViewedProperty = {
  slug: string;
  title: string;
  cover_image_url: string | null;
  price_ngn: number;
  city: string;
  state: string;
  purpose: string;
};

const STORAGE_KEY = "oaks_recently_viewed";
const MAX_ITEMS = 6;

export function addRecentlyViewed(p: RecentlyViewedProperty): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getRecentlyViewed().filter((r) => r.slug !== p.slug);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([p, ...existing].slice(0, MAX_ITEMS)));
  } catch {}
}

export function getRecentlyViewed(): RecentlyViewedProperty[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecentlyViewedProperty[]) : [];
  } catch {
    return [];
  }
}
