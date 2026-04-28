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

  // Direct MP4 / video file
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(trimmed)) {
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

/** Returns a human-readable label for a video URL. */
export function videoLabel(url: string): string {
  const parsed = parseVideoUrl(url);
  if (!parsed) return url;
  if (parsed.type === "youtube") return "YouTube video";
  if (parsed.type === "vimeo") return "Vimeo video";
  return "Video file";
}
