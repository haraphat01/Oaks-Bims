import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CurrencyProvider } from "@/components/currency-provider";
import { ComparisonProvider } from "@/components/comparison-provider";
import { ComparisonBar } from "@/components/comparison-bar";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppButton } from "@/components/whatsapp-button";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://oaksandbims.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "Oaks & Bims Nigeria Limited — Buy, Sell & Manage Property in Nigeria",
    template: "%s · Oaks & Bims Nigeria",
  },
  description:
    "Nigeria's trusted real estate partner. Verified properties across all 36 states — homes, land, and investments for buyers at home and in the diaspora. Transparent pricing. No hidden fees.",
  keywords: [
    "buy property in Nigeria",
    "Nigerian real estate",
    "houses for sale Lagos",
    "land for sale Abuja",
    "Nigeria diaspora property investment",
    "buy house Nigeria UK",
    "Nigeria property management",
    "Oaks and Bims",
    "real estate Nigeria 2026",
    "Lagos property for sale",
    "Abuja houses for sale",
    "Nigerian property developer",
    "verified property Nigeria",
    "Certificate of Occupancy Nigeria",
    "buy land Nigeria",
  ],
  authors: [{ name: "Oaks & Bims Nigeria Limited", url: BASE }],
  creator: "Oaks & Bims Nigeria Limited",
  publisher: "Oaks & Bims Nigeria Limited",
  alternates: { canonical: BASE },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: BASE,
    siteName: "Oaks & Bims Nigeria Limited",
    title: "Oaks & Bims — Real Estate Across All 36 States of Nigeria",
    description:
      "Buy, develop, and manage prime property across Nigeria. Verified titles, transparent pricing, and dedicated support for buyers at home and in the diaspora.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Oaks & Bims — Real Estate Across All 36 States of Nigeria",
    description:
      "Verified properties for sale and rent across Nigeria. Trusted by buyers at home and in the diaspora.",
    creator: "@oaksandbims",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Oaks & Bims Nigeria Limited",
  alternateName: "Oaks and Bims",
  description:
    "Full-service real estate company helping Nigerians at home and in the diaspora buy, develop, and manage property across all 36 states of Nigeria.",
  url: BASE,
  logo: `${BASE}/icon.svg`,
  image: `${BASE}/opengraph-image`,
  telephone: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? undefined,
  legalName: "Oaks & Bims Nigeria Limited",
  identifier: {
    "@type": "PropertyValue",
    name: "CAC Registration Number",
    value: "RC 1754177",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Lagos",
    addressCountry: "NG",
  },
  areaServed: {
    "@type": "Country",
    name: "Nigeria",
  },
  knowsAbout: [
    "Real estate development Nigeria",
    "Property management Nigeria",
    "Land acquisition Nigeria",
    "Diaspora property investment Nigeria",
    "Certificate of Occupancy",
  ],
  serviceType: [
    "Real Estate Development",
    "Property Management",
    "Property Acquisition",
    "After-sale Renovation",
  ],
  sameAs: [],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Oaks & Bims Nigeria Limited",
  url: BASE,
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${BASE}/properties?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans">
        <CurrencyProvider>
          <ComparisonProvider>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <WhatsAppButton />
            <ComparisonBar />
          </ComparisonProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
