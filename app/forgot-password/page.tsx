"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const email = String(new FormData(e.currentTarget).get("email") ?? "");

    const originRes = await fetch("/api/auth/site-url");
    const originPayload = (await originRes.json().catch(() => ({}))) as { site?: string };
    const site =
      originRes.ok && typeof originPayload.site === "string"
        ? originPayload.site
        : window.location.origin;

    const supabase = createClient();
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${site}/auth/callback?next=/reset-password`,
    });

    setLoading(false);
    if (resetErr) return setError(resetErr.message);
    setSent(true);
  }

  return (
    <div className="container max-w-md py-16">
      <div className="rounded-xl border bg-card p-8">
        <h1 className="text-2xl font-serif font-semibold">Reset your password</h1>
        {sent ? (
          <p className="mt-4 text-sm text-muted-foreground">
            If an account exists for that email, we&apos;ve sent a reset link.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            {error && <div className="text-sm text-destructive">{error}</div>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Sending…" : "Send reset link"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
