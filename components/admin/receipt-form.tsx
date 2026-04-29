"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { Inquiry, Property } from "@/lib/types";

type Props = {
  properties: Pick<Property, "id" | "title" | "city" | "state">[];
  inquiries: (Pick<Inquiry, "id" | "full_name" | "email" | "phone" | "property_id"> & {
    properties: { title: string } | null;
  })[];
  defaultInquiryId?: string;
};

export function ReceiptForm({ properties, inquiries, defaultInquiryId }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [inquiryId, setInquiryId] = useState(defaultInquiryId ?? "");
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [amountNgn, setAmountNgn] = useState("");
  const [method, setMethod] = useState("bank_transfer");
  const [ref, setRef] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("paid");

  // Pre-fill from a selected inquiry
  function loadInquiry(id: string) {
    setInquiryId(id);
    if (!id) return;
    const q = inquiries.find((i) => i.id === id);
    if (!q) return;
    setBuyerName(q.full_name);
    setBuyerEmail(q.email);
    setBuyerPhone(q.phone ?? "");
    if (q.property_id) setPropertyId(q.property_id);
  }

  // pre-fill on mount if defaultInquiryId provided
  useState(() => {
    if (defaultInquiryId) loadInquiry(defaultInquiryId);
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      inquiry_id:     inquiryId || null,
      property_id:    propertyId || null,
      buyer_name:     buyerName.trim(),
      buyer_email:    buyerEmail.trim(),
      buyer_phone:    buyerPhone.trim() || null,
      buyer_address:  buyerAddress.trim() || null,
      amount_ngn:     Number(amountNgn),
      payment_method: method,
      payment_ref:    ref.trim() || null,
      notes:          notes.trim() || null,
      status,
    };

    try {
      const res = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Failed to create receipt");
      }
      const data = await res.json();
      router.push(`/admin/receipts/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-2xl">
      {/* Pre-fill from inquiry */}
      {inquiries.length > 0 && (
        <div className="rounded-xl border bg-card p-5 space-y-3">
          <div className="font-medium text-sm">Pre-fill from inquiry (optional)</div>
          <div>
            <Label htmlFor="inquiry_id">Select an inquiry</Label>
            <Select
              id="inquiry_id"
              value={inquiryId}
              onChange={(e) => loadInquiry(e.target.value)}
            >
              <option value="">— choose —</option>
              {inquiries.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.full_name} · {q.email}
                  {q.properties ? ` — ${q.properties.title}` : ""}
                </option>
              ))}
            </Select>
          </div>
        </div>
      )}

      {/* Buyer details */}
      <fieldset className="rounded-xl border bg-card p-5 space-y-4">
        <legend className="font-semibold px-1 -ml-1">Buyer details</legend>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="buyer_name">Full name *</Label>
            <Input id="buyer_name" required value={buyerName} onChange={(e) => setBuyerName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="buyer_email">Email *</Label>
            <Input id="buyer_email" type="email" required value={buyerEmail} onChange={(e) => setBuyerEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="buyer_phone">Phone</Label>
            <Input id="buyer_phone" value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)} placeholder="+234…" />
          </div>
          <div>
            <Label htmlFor="buyer_address">Address</Label>
            <Input id="buyer_address" value={buyerAddress} onChange={(e) => setBuyerAddress(e.target.value)} />
          </div>
        </div>
      </fieldset>

      {/* Property + amount */}
      <fieldset className="rounded-xl border bg-card p-5 space-y-4">
        <legend className="font-semibold px-1 -ml-1">Transaction details</legend>
        <div>
          <Label htmlFor="property_id">Property</Label>
          <Select id="property_id" value={propertyId} onChange={(e) => setPropertyId(e.target.value)}>
            <option value="">— not linked to a listing —</option>
            {properties.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} — {p.city}, {p.state}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="amount_ngn">Amount (NGN) *</Label>
            <Input
              id="amount_ngn"
              type="number"
              min="1"
              step="0.01"
              required
              value={amountNgn}
              onChange={(e) => setAmountNgn(e.target.value)}
              placeholder="e.g. 5000000"
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="paid">Paid in full</option>
              <option value="partial">Partial payment</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="method">Payment method</Label>
            <Select id="method" value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
              <option value="pos">POS / Card</option>
              <option value="online">Online Payment</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="payment_ref">Reference / Transaction ID</Label>
            <Input id="payment_ref" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="e.g. TRF123456789" />
          </div>
        </div>
        <div>
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Initial deposit. Balance of ₦5,000,000 due by 30 June 2026."
          />
        </div>
      </fieldset>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={saving}>
        {saving ? "Generating…" : "Generate receipt"}
      </Button>
    </form>
  );
}
