import { MortgageCalculator } from "@/components/mortgage-calculator";

export const metadata = { title: "Mortgage Calculator" };

export default function MortgageCalculatorPage({
  searchParams,
}: {
  searchParams: { price?: string };
}) {
  const defaultPrice =
    typeof searchParams.price === "string"
      ? Math.max(0, parseInt(searchParams.price, 10) || 0)
      : undefined;

  return (
    <div className="container py-10 md:py-14 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-serif font-semibold">Mortgage Calculator</h1>
        <p className="text-muted-foreground mt-2">
          Estimate your monthly mortgage repayment for a Nigerian property. Adjust the
          interest rate to reflect your lender&apos;s offer — typical Nigerian commercial
          bank rates are 18–25% per annum.
        </p>
      </div>

      <MortgageCalculator defaultPrice={defaultPrice} />

      <div className="mt-6 rounded-lg border bg-card/60 p-4 text-xs text-muted-foreground space-y-1.5">
        <p><strong>Note:</strong> This calculator is for estimation purposes only.</p>
        <p>• Federal Mortgage Bank of Nigeria (FMBN) NHF loans: ~6% p.a. for qualified contributors.</p>
        <p>• Commercial bank mortgages: typically 18–25% p.a.</p>
        <p>• Actual repayments will depend on your lender&apos;s terms, fees, and applicable taxes.</p>
      </div>
    </div>
  );
}
