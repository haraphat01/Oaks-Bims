"use client";

import * as React from "react";
import { type Currency, FALLBACK_RATES } from "@/lib/currency";

type RateMap = Record<Currency, number>;

type CurrencyContextValue = {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  rates: RateMap;
};

const CurrencyContext = React.createContext<CurrencyContextValue | null>(null);

const STORAGE_KEY = "oaks-currency";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = React.useState<Currency>("NGN");
  const [rates, setRates] = React.useState<RateMap>(FALLBACK_RATES);

  // hydrate from localStorage
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Currency | null;
      if (saved && (saved === "NGN" || saved === "USD" || saved === "GBP")) {
        setCurrencyState(saved);
      }
    } catch {}
  }, []);

  // fetch live rates once per session
  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/fx-rates")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data?.rates?.NGN && data?.rates?.USD && data?.rates?.GBP) {
          setRates(data.rates);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const setCurrency = React.useCallback((c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {}
  }, []);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = React.useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside CurrencyProvider");
  return ctx;
}
