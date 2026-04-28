import { NextResponse } from "next/server";
import { FALLBACK_RATES } from "@/lib/currency";

// Cache for 12 hours.
export const revalidate = 43200;

/**
 * Returns rates as multipliers FROM NGN to each currency.
 * { NGN: 1, USD: 0.000666, GBP: 0.000526 }
 */
export async function GET() {
  const url = process.env.FX_RATES_API_URL;
  if (!url) {
    return NextResponse.json({ rates: FALLBACK_RATES, source: "fallback" });
  }
  try {
    const res = await fetch(url, { next: { revalidate: 43200 } });
    if (!res.ok) throw new Error("fx fetch failed");
    const data = (await res.json()) as { rates?: Record<string, number> };
    if (!data.rates) throw new Error("no rates");
    return NextResponse.json({
      rates: {
        NGN: 1,
        USD: data.rates.USD ?? FALLBACK_RATES.USD,
        GBP: data.rates.GBP ?? FALLBACK_RATES.GBP,
      },
      source: "api",
    });
  } catch {
    return NextResponse.json({ rates: FALLBACK_RATES, source: "fallback" });
  }
}
