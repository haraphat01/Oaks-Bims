"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type Props = {
  user: { email: string | null; role: "admin" | "customer" | null } | null;
};

const NAV_LINKS = [
  { href: "/properties", label: "Properties" },
  { href: "/properties?purpose=sale", label: "Buy" },
  { href: "/properties?purpose=rent", label: "Rent" },
  { href: "/properties?property_type=land", label: "Land" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function MobileNav({ user }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <div
            id="mobile-nav-drawer"
            className="fixed inset-x-0 top-16 z-50 border-b bg-background shadow-xl"
          >
            <div className="container py-4">
              <nav className="flex flex-col">
                {NAV_LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="flex items-center py-3 text-sm font-medium border-b border-border/50 last:border-b-0 hover:text-primary transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-4 pt-4 border-t flex flex-col gap-2">
                {user ? (
                  <>
                    {user.role === "admin" && (
                      <Button asChild variant="outline" className="w-full justify-start">
                        <Link href="/admin">Admin panel</Link>
                      </Button>
                    )}
                    <Button asChild variant="secondary" className="w-full justify-start">
                      <Link href="/account">My account</Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-muted-foreground"
                      onClick={signOut}
                    >
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild className="w-full">
                      <Link href="/signup">Create account</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/login">Log in</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
