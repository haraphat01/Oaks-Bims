"use client";

import { useState, useMemo } from "react";
import { Calculator } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { formatMoney } from "@/lib/currency";

function calcMonthly(principal: number, annualRate: number, termYears: number): number {
  if (principal <= 0 || termYears <= 0) return 0;
  if (annualRate === 0) return principal / (termYears * 12);
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

const fmt = (n: number) => formatMoney(n, "NGN");

export function MortgageCalculator({ defaultPrice }: { defaultPrice?: number }) {
  const [price, setPrice] = useState(defaultPrice ?? 0);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(22);
  const [years, setYears] = useState(20);

  const downAmount = (price * downPct) / 100;
  const principal = Math.max(0, price - downAmount);
  const monthly = useMemo(() => calcMonthly(principal, rate, years), [principal, rate, years]);
  const totalPaid = monthly * years * 12;
  const totalInterest = Math.max(0, totalPaid - principal);

  const totalForBar = downAmount + principal + totalInterest;
  const downPctBar = totalForBar > 0 ? (downAmount / totalForBar) * 100 : 0;
  const principalPctBar = totalForBar > 0 ? (principal / totalForBar) * 100 : 0;
  const interestPctBar = totalForBar > 0 ? (totalInterest / totalForBar) * 100 : 0;

  return (
    <div className="rounded-xl border bg-card p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Calculator className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-serif font-semibold">Mortgage Calculator</h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Property price */}
        <div className="sm:col-span-2">
          <Label>Property price (₦)</Label>
          <Input
            type="number"
            min={0}
            step={500000}
            value={price || ""}
            placeholder="e.g. 50000000"
            className="mt-1.5"
            onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
          />
        </div>

        {/* Down payment */}
        <div>
          <Label>Down payment</Label>
          <div className="mt-1.5 flex gap-2 items-center">
            <Input
              type="number"
              min={0}
              max={100}
              step={5}
              value={downPct}
              className="w-24"
              onChange={(e) => setDownPct(Math.min(100, Math.max(0, Number(e.target.value))))}
            />
            <span className="text-sm text-muted-foreground">%</span>
            <span className="text-sm text-muted-foreground">=</span>
            <span className="text-sm font-medium">{fmt(downAmount)}</span>
          </div>
        </div>

        {/* Interest rate */}
        <div>
          <Label>Annual interest rate (%)</Label>
          <div className="mt-1.5 flex gap-2 items-center">
            <Input
              type="number"
              min={1}
              max={40}
              step={0.5}
              value={rate}
              className="w-24"
              onChange={(e) => setRate(Math.min(40, Math.max(1, Number(e.target.value))))}
            />
            <span className="text-xs text-muted-foreground">
              Typical Nigerian bank rate: 18–25%
            </span>
          </div>
        </div>

        {/* Loan term */}
        <div>
          <Label>Loan term</Label>
          <Select
            value={String(years)}
            className="mt-1.5 w-40"
            onChange={(e) => setYears(Number(e.target.value))}
          >
            {[5, 10, 15, 20, 25, 30].map((y) => (
              <option key={y} value={y}>{y} years</option>
            ))}
          </Select>
        </div>
      </div>

      {/* Results */}
      {price > 0 && monthly > 0 && (
        <div className="rounded-lg bg-secondary/50 p-5 space-y-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Monthly payment</div>
            <div className="text-3xl font-bold text-primary mt-1">{fmt(monthly)}</div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <ResultItem label="Loan amount" value={fmt(principal)} />
            <ResultItem label="Total interest" value={fmt(totalInterest)} />
            <ResultItem label="Total cost" value={fmt(totalPaid + downAmount)} />
          </div>

          {/* Visual bar */}
          <div>
            <div className="flex rounded-full overflow-hidden h-3 gap-px">
              {downPctBar > 0 && (
                <div
                  style={{ width: `${downPctBar}%` }}
                  className="bg-muted-foreground/40"
                  title={`Down payment: ${fmt(downAmount)}`}
                />
              )}
              {principalPctBar > 0 && (
                <div
                  style={{ width: `${principalPctBar}%` }}
                  className="bg-primary"
                  title={`Loan principal: ${fmt(principal)}`}
                />
              )}
              {interestPctBar > 0 && (
                <div
                  style={{ width: `${interestPctBar}%` }}
                  className="bg-amber-400"
                  title={`Total interest: ${fmt(totalInterest)}`}
                />
              )}
            </div>
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground/40" />
                Down payment
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                Principal
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-400" />
                Interest
              </span>
            </div>
          </div>
        </div>
      )}

      {price === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Enter a property price above to see your estimated monthly payment.
        </p>
      )}
    </div>
  );
}

function ResultItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-semibold mt-0.5">{value}</div>
    </div>
  );
}
