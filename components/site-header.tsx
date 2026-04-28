import Link from "next/link";
import { CurrencyToggle } from "@/components/currency-toggle";
import { UserMenu } from "@/components/user-menu";
import { MobileNav } from "@/components/mobile-nav";
import { createClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let role: "admin" | "customer" | null = null;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    role = (profile?.role as "admin" | "customer") ?? "customer";
  }

  const userProp = user ? { email: user.email ?? null, role } : null;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 rounded-md bg-primary text-primary-foreground grid place-items-center font-serif text-lg font-bold">O</div>
          <div className="leading-tight">
            <div className="font-semibold tracking-tight">Oaks &amp; Bims</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground hidden sm:block">Nigeria Limited</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/properties" className="hover:text-primary transition-colors">Properties</Link>
          <Link href="/properties?purpose=sale" className="hover:text-primary transition-colors">Buy</Link>
          <Link href="/properties?purpose=rent" className="hover:text-primary transition-colors">Rent</Link>
          <Link href="/properties?property_type=land" className="hover:text-primary transition-colors">Land</Link>
          <Link href="/about" className="hover:text-primary transition-colors">About</Link>
          <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <CurrencyToggle />
          {/* Desktop user menu */}
          <div className="hidden md:flex items-center gap-2">
            <UserMenu user={userProp} />
          </div>
          {/* Mobile hamburger */}
          <MobileNav user={userProp} />
        </div>
      </div>
    </header>
  );
}
