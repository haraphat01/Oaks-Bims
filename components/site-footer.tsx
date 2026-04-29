import Link from "next/link";
import { NewsletterForm } from "@/components/newsletter-form";

export function SiteFooter() {
  return (
    <footer className="border-t bg-secondary/30 mt-16">
      <div className="container py-10 md:py-12 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-semibold text-lg">Oaks &amp; Bims Nigeria Limited</div>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">
            Real estate development, property management, purchasing, and after-sale care — built for buyers at home and in the diaspora.
          </p>
          <div className="mt-6 max-w-sm">
            <div className="text-sm font-medium mb-2">Get new listings in your inbox</div>
            <NewsletterForm />
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold">Browse</div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link href="/properties" className="hover:text-foreground">All properties</Link></li>
            <li><Link href="/properties?purpose=sale" className="hover:text-foreground">For sale</Link></li>
            <li><Link href="/properties?purpose=rent" className="hover:text-foreground">For rent</Link></li>
            <li><Link href="/properties?property_type=land" className="hover:text-foreground">Land</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-sm font-semibold">Company</div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link href="/about" className="hover:text-foreground">About</Link></li>
            <li><Link href="/contact" className="hover:text-foreground">Contact</Link></li>
            <li><Link href="/login" className="hover:text-foreground">Log in</Link></li>
            <li><Link href="/signup" className="hover:text-foreground">Create account</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t">
        <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} Oaks &amp; Bims Nigeria Limited. All rights reserved.</div>
          <div>RC: 1754177</div>
        </div>
      </div>
    </footer>
  );
}
