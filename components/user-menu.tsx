"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type Props = {
  user: { email: string | null; role: "admin" | "customer" | null } | null;
};

export function UserMenu({ user }: Props) {
  const router = useRouter();

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/login">Log in</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/signup">Sign up</Link>
        </Button>
      </div>
    );
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  }

  return (
    <div className="flex items-center gap-2">
      {user.role === "admin" && (
        <Button asChild variant="outline" size="sm">
          <Link href="/admin">Admin</Link>
        </Button>
      )}
      <Button asChild variant="ghost" size="sm">
        <Link href="/account">Account</Link>
      </Button>
      <Button onClick={signOut} variant="ghost" size="sm">
        Sign out
      </Button>
    </div>
  );
}
