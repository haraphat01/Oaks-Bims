type VideoType = "youtube" | "vimeo" | "direct";

type ParsedVideo = { type: VideoType; embedUrl: string; originalUrl: string };

export function parseVideoUrl(url: string): ParsedVideo | null {
  const trimmed = url.trim();

  // YouTube: watch?v=, youtu.be/, /embed/
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) {
    return {
      type: "youtube",
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
      originalUrl: trimmed,
    };
  }

  // Vimeo: vimeo.com/ID
  const vimeoMatch = trimmed.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return {
      type: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      originalUrl: trimmed,
    };
  }

  // Direct video file — mp4, webm, ogg, mov (QuickTime / iOS uploads)
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(trimmed)) {
    return { type: "direct", embedUrl: trimmed, originalUrl: trimmed };
  }

  return null;
}

export function VideoEmbed({ url, title }: { url: string; title?: string }) {
  const parsed = parseVideoUrl(url);
  if (!parsed) return null;

  if (parsed.type === "direct") {
    return (
      <video
        controls
        preload="metadata"
        playsInline
        className="w-full rounded-xl aspect-video bg-black"
        aria-label={title}
      >
        <source src={parsed.embedUrl} />
      </video>
    );
  }

  return (
    <div className="relative w-full rounded-xl overflow-hidden aspect-video bg-black">
      <iframe
        src={parsed.embedUrl}
        title={title || "Property video"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full"
        loading="lazy"
      />
    </div>
  );
}

/** Human-readable label shown in the admin video list. */
export function videoLabel(url: string): string {
  const parsed = parseVideoUrl(url);
  if (!parsed) return "Unknown format";
  if (parsed.type === "youtube") return "YouTube";
  if (parsed.type === "vimeo") return "Vimeo";
  // Extract the filename from the URL path (works for Supabase storage URLs too)
  try {
    const filename = new URL(url).pathname.split("/").pop();
    return filename || "Uploaded video";
  } catch {
    return "Uploaded video";
  }
}
