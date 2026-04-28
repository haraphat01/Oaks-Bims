// Database row types — kept hand-maintained (lightweight) so we don't
// require `supabase gen types`. They mirror supabase/schema.sql.

export type ListingStatus = "draft" | "available" | "under_offer" | "sold" | "rented";
export type ListingPurpose = "sale" | "rent" | "shortlet";
export type UserRole = "customer" | "admin";

export type PropertyType =
  | "detached_house"
  | "semi_detached"
  | "terraced"
  | "duplex"
  | "bungalow"
  | "apartment"
  | "flat"
  | "penthouse"
  | "studio"
  | "land"
  | "commercial"
  | "office"
  | "shop"
  | "warehouse"
  | "mixed_use";

export const PROPERTY_TYPE_LABEL: Record<PropertyType, string> = {
  detached_house: "Detached house",
  semi_detached: "Semi-detached",
  terraced: "Terrace / Terraced duplex",
  duplex: "Duplex",
  bungalow: "Bungalow",
  apartment: "Apartment",
  flat: "Flat",
  penthouse: "Penthouse",
  studio: "Studio",
  land: "Land",
  commercial: "Commercial",
  office: "Office",
  shop: "Shop",
  warehouse: "Warehouse",
  mixed_use: "Mixed-use",
};

export const PROPERTY_TYPES: PropertyType[] = Object.keys(PROPERTY_TYPE_LABEL) as PropertyType[];

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  country: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type Property = {
  id: string;
  slug: string;
  title: string;
  description: string;
  price_ngn: number;
  purpose: ListingPurpose;
  status: ListingStatus;
  property_type: PropertyType;
  state: string;
  city: string;
  address: string | null;
  bedrooms: number;
  bathrooms: number;
  toilets: number;
  area_sqm: number | null;
  plot_size_sqm: number | null;
  parking_spaces: number;
  year_built: number | null;
  features: string[];
  amenities: string[];
  image_urls: string[];
  video_urls: string[];
  cover_image_url: string | null;
  is_featured: boolean;
  views_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type Inquiry = {
  id: string;
  property_id: string | null;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  country: string | null;
  message: string;
  is_handled: boolean;
  created_at: string;
};

export type NewsletterSubscriber = {
  id: string;
  email: string;
  full_name: string | null;
  is_confirmed: boolean;
  confirm_token: string;
  unsub_token: string;
  created_at: string;
  confirmed_at: string | null;
};
