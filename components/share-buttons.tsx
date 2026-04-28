"use client";

import { useState } from "react";
import { Share2, MessageCircle, Twitter, Facebook, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ShareButtons({ title, path }: { title: string; path: string }) {
  const [copied, setCopied] = useState(false);

  const siteUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || "";
  const shareUrl = `${siteUrl}${path}`;
  const text = `Check out this property on Oaks & Bims: ${title}`;

  const waHref = `https://wa.me/?text=${encodeURIComponent(`${text}\n${shareUrl}`)}`;
  const xHref = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground flex items-center gap-1.5">
        <Share2 className="h-3.5 w-3.5" />
        Share:
      </span>
      <a href={waHref} target="_blank" rel="noopener noreferrer">
        <Button size="sm" variant="outline" className="gap-1.5 h-8">
          <MessageCircle className="h-3.5 w-3.5" />
          WhatsApp
        </Button>
      </a>
      <a href={xHref} target="_blank" rel="noopener noreferrer">
        <Button size="sm" variant="outline" className="gap-1.5 h-8">
          <Twitter className="h-3.5 w-3.5" />X
        </Button>
      </a>
      <a href={fbHref} target="_blank" rel="noopener noreferrer">
        <Button size="sm" variant="outline" className="gap-1.5 h-8">
          <Facebook className="h-3.5 w-3.5" />
          Facebook
        </Button>
      </a>
      <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={copyLink}>
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-600" />
        ) : (
          <Link2 className="h-3.5 w-3.5" />
        )}
        {copied ? "Copied!" : "Copy link"}
      </Button>
    </div>
  );
}
