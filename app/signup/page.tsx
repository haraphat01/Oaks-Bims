"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    const full_name = String(fd.get("full_name") ?? "");

    const originRes = await fetch("/api/auth/site-url");
    const originPayload = (await originRes.json().catch(() => ({}))) as { site?: string };
    const site =
      originRes.ok && typeof originPayload.site === "string"
        ? originPayload.site
        : window.location.origin;

    const supabase = createClient();
    const { error: signErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name },
        emailRedirectTo: `${site}/auth/callback`,
      },
    });

    setLoading(false);
    if (signErr) return setError(signErr.message);
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="container max-w-md py-16">
        <div className="rounded-xl border bg-card p-8 text-center">
          <h1 className="text-2xl font-serif font-semibold">Check your email</h1>
          <p className="text-muted-foreground mt-3">
            We&apos;ve sent you a confirmation link. Click it to verify your email and finish creating your account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-md py-16">
      <div className="rounded-xl border bg-card p-8">
        <h1 className="text-2xl font-serif font-semibold">Create your account</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Save listings, track inquiries, and get new properties first.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" name="full_name" required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
            <p className="text-xs text-muted-foreground mt-1">At least 8 characters.</p>
          </div>
          {error && <div className="text-sm text-destructive">{error}</div>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>
        <div className="mt-4 text-sm text-center text-muted-foreground">
          Already have an account? <Link href="/login" className="text-primary font-medium hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
}
