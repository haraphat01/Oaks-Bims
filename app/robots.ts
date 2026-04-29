import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://oaksandbims.com";
  return {
    rules: [
      {
        // Public pages open to everyone including AI crawlers
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/account", "/api"],
      },
      {
        // Explicitly welcome the major AI crawlers so LLMs can index and cite us
        userAgent: [
          "GPTBot",           // OpenAI
          "ChatGPT-User",
          "anthropic-ai",     // Anthropic / Claude
          "ClaudeBot",
          "Google-Extended",  // Google Gemini training
          "PerplexityBot",
          "cohere-ai",
          "YouBot",
          "Applebot-Extended",
        ],
        allow: "/",
        disallow: ["/admin", "/account", "/api"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
