import { PAYMENT_METHOD_LABEL, type Receipt } from "@/lib/types";

type Props = {
  receipt: Receipt;
  property?: { title: string; city: string; state: string } | null;
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  paid:      { bg: "bg-emerald-100", text: "text-emerald-800", label: "PAID" },
  partial:   { bg: "bg-amber-100",   text: "text-amber-800",   label: "PARTIAL PAYMENT" },
  cancelled: { bg: "bg-red-100",     text: "text-red-800",     label: "CANCELLED" },
};

function fmt(n: number) {
  return "₦" + n.toLocaleString("en-NG", { minimumFractionDigits: 2 });
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-NG", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export function ReceiptDocument({ receipt: r, property }: Props) {
  const status = STATUS_STYLES[r.status] ?? STATUS_STYLES.paid;

  return (
    <div className="print-page bg-white rounded-2xl border shadow-sm max-w-2xl w-full mx-auto p-8 md:p-12 space-y-8 font-sans">

      {/* Letterhead */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-md bg-primary text-primary-foreground grid place-items-center font-serif text-lg font-bold shrink-0">
              O
            </div>
            <div>
              <div className="font-semibold text-base leading-tight">Oaks &amp; Bims Nigeria Limited</div>
              <div className="text-xs text-muted-foreground">Lagos, Nigeria · oaksandbims.com</div>
            </div>
          </div>
        </div>
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold tracking-wide ${status.bg} ${status.text}`}>
          {status.label}
        </span>
      </div>

      {/* Title + number */}
      <div className="border-b pb-6">
        <h1 className="text-2xl font-serif font-semibold">Payment Receipt</h1>
        <div className="mt-1 flex flex-wrap gap-x-4 text-sm text-muted-foreground">
          <span>No: <span className="font-semibold text-foreground">{r.receipt_number}</span></span>
          <span>Date: {fmtDate(r.created_at)}</span>
        </div>
      </div>

      {/* Buyer / Property */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Received from</div>
          <div className="font-semibold">{r.buyer_name}</div>
          <div className="text-sm text-muted-foreground mt-0.5">{r.buyer_email}</div>
          {r.buyer_phone && <div className="text-sm text-muted-foreground">{r.buyer_phone}</div>}
          {r.buyer_address && <div className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{r.buyer_address}</div>}
        </div>
        {property && (
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">For property</div>
            <div className="font-semibold">{property.title}</div>
            <div className="text-sm text-muted-foreground mt-0.5">{property.city}, {property.state}</div>
          </div>
        )}
      </div>

      {/* Amount */}
      <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-6 py-5">
        <div className="text-[10px] uppercase tracking-widest text-emerald-700 mb-1">Amount paid</div>
        <div className="text-4xl font-serif font-bold text-primary">{fmt(r.amount_ngn)}</div>
      </div>

      {/* Payment details */}
      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <Row label="Payment method" value={PAYMENT_METHOD_LABEL[r.payment_method] ?? r.payment_method} />
        {r.payment_ref && <Row label="Reference / Transaction ID" value={r.payment_ref} />}
        <Row label="Date" value={fmtDate(r.created_at)} />
        <Row label="Receipt number" value={r.receipt_number} />
      </div>

      {/* Notes */}
      {r.notes && (
        <div className="rounded-lg border-l-4 border-primary/30 bg-secondary/40 px-4 py-3 text-sm text-muted-foreground whitespace-pre-line">
          {r.notes}
        </div>
      )}

      {/* Signature */}
      <div className="border-t pt-8 grid sm:grid-cols-2 gap-8">
        <div>
          <div className="h-10 border-b border-foreground/30 mb-2" />
          <div className="text-xs text-muted-foreground">Authorised signature &amp; stamp</div>
        </div>
        <div className="text-xs text-muted-foreground text-right self-end">
          <p>Oaks &amp; Bims Nigeria Limited</p>
          <p>RC: [Pending CAC]</p>
          <p className="mt-1">This receipt confirms payment received.</p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
