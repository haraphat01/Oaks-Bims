"use client";

import { useState } from "react";
import { Printer, Mail, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReceiptActions({
  receiptId,
  buyerEmail,
}: {
  receiptId: string;
  buyerEmail: string;
}) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  async function sendEmail() {
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch(`/api/receipts/${receiptId}/send`, { method: "POST" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Failed to send email");
      }
      setSent(true);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {sendError && <span className="text-xs text-destructive">{sendError}</span>}
      <Button variant="outline" size="sm" onClick={() => window.print()}>
        <Printer className="h-4 w-4" /> Print / Save PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={sendEmail}
        disabled={sending || sent}
      >
        {sending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : sent ? (
          <Check className="h-4 w-4 text-emerald-600" />
        ) : (
          <Mail className="h-4 w-4" />
        )}
        {sent ? `Sent to ${buyerEmail}` : "Email to buyer"}
      </Button>
    </div>
  );
}
