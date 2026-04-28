// Currency helpers — NGN base, with USD/GBP conversion.

export type Currency = "NGN" | "USD" | "GBP";

export const CURRENCY_LABEL: Record<Currency, string> = {
  NGN: "₦ NGN",
  USD: "$ USD",
  GBP: "£ GBP",
};

export const CURRENCY_SYMBOL: Record<Currency, string> = {
  NGN: "₦",
  USD: "$",
  GBP: "£",
};

// Sensible fallback rates (1 NGN = X). Overridden by /api/fx-rates at runtime.
// As of 2026 these are placeholders — the live API call is the source of truth.
export const FALLBACK_RATES: Record<Currency, number> = {
  NGN: 1,
  USD: 1 / 1500,
  GBP: 1 / 1900,
};

export function convertFromNgn(amountNgn: number, to: Currency, rates: Record<Currency, number>): number {
  return amountNgn * (rates[to] ?? FALLBACK_RATES[to]);
}

export function formatMoney(amount: number, currency: Currency): string {
  const locale = currency === "NGN" ? "en-NG" : currency === "GBP" ? "en-GB" : "en-US";
  if (currency === "NGN") {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: amount > 1000 ? 0 : 2,
  }).format(amount);
}

export function formatNgnIn(amountNgn: number, currency: Currency, rates: Record<Currency, number>): string {
  return formatMoney(convertFromNgn(amountNgn, currency, rates), currency);
}
