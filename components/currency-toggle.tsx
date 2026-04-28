"use client";

import { useCurrency } from "@/components/currency-provider";
import { CURRENCY_LABEL, type Currency } from "@/lib/currency";

export function CurrencyToggle({ className }: { className?: string }) {
  const { currency, setCurrency } = useCurrency();
  return (
    <div className={className}>
      <select
        aria-label="Display currency"
        value={currency}
        onChange={(e) => setCurrency(e.target.value as Currency)}
        className="h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {(Object.keys(CURRENCY_LABEL) as Currency[]).map((c) => (
          <option key={c} value={c}>
            {CURRENCY_LABEL[c]}
          </option>
        ))}
      </select>
    </div>
  );
}
