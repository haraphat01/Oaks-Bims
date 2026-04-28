"use client";

import { useCurrency } from "@/components/currency-provider";
import { formatNgnIn } from "@/lib/currency";

export function PriceDisplay({ ngn, className }: { ngn: number; className?: string }) {
  const { currency, rates } = useCurrency();
  return <span className={className}>{formatNgnIn(ngn, currency, rates)}</span>;
}
