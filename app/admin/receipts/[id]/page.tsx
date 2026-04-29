import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ReceiptDocument } from "@/components/receipt-document";
import { ReceiptActions } from "@/components/admin/receipt-actions";
import type { Receipt } from "@/lib/types";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props) {
  const supabase = createClient();
  const { data } = await supabase
    .from("receipts").select("receipt_number").eq("id", params.id).single();
  return { title: data ? `Receipt ${data.receipt_number}` : "Receipt" };
}

export default async function ReceiptDetailPage({ params }: Props) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("receipts")
    .select("*, properties(title,city,state,slug)")
    .eq("id", params.id)
    .single();

  if (error || !data) notFound();

  const receipt = data as Receipt;
  const property = (data.properties as { title: string; city: string; state: string; slug: string } | null);

  return (
    <div className="space-y-6">
      {/* Actions bar — hidden on print */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/receipts">
            <ArrowLeft className="h-4 w-4" /> All receipts
          </Link>
        </Button>
        <ReceiptActions receiptId={receipt.id} buyerEmail={receipt.buyer_email} />
      </div>

      <ReceiptDocument receipt={receipt} property={property} />
    </div>
  );
}
