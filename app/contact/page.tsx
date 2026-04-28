import { Mail, Phone, MapPin } from "lucide-react";
import { InquiryForm } from "@/components/inquiry-form";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="container py-10 md:py-20 grid lg:grid-cols-2 gap-10 lg:gap-12 max-w-6xl">
      <div>
        <div className="text-xs uppercase tracking-widest text-primary">Get in touch</div>
        <h1 className="mt-2 text-4xl md:text-5xl font-serif font-semibold">Talk to a real human.</h1>
        <p className="mt-4 text-muted-foreground leading-relaxed">
          Whether you&apos;re buying your first home in Lekki, building a rental portfolio in Abuja, or buying from
          London — we&apos;ll respond within 24 hours.
        </p>

        <ul className="mt-8 space-y-4 text-sm">
          <li className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <div className="font-medium">Email</div>
              <a href="mailto:hello@oaksandbims.com" className="text-muted-foreground hover:text-primary">hello@oaksandbims.com</a>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Phone className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <div className="font-medium">Phone &amp; WhatsApp</div>
              <a href="tel:+2340000000000" className="text-muted-foreground hover:text-primary">+234 000 000 0000</a>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <div className="font-medium">Office</div>
              <div className="text-muted-foreground">Lagos, Nigeria · By appointment only</div>
            </div>
          </li>
        </ul>
      </div>

      <div className="rounded-xl border bg-card p-6 md:p-8">
        <h2 className="text-xl font-semibold">Send us a message</h2>
        <p className="text-sm text-muted-foreground mt-1">We&apos;ll route your message to the right person on our team.</p>
        <div className="mt-6">
          <InquiryForm />
        </div>
      </div>
    </div>
  );
}
