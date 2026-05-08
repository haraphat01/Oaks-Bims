// Runs entirely in the browser — no server round-trip needed.
// Called before every property image is uploaded to Supabase Storage so that
// the watermark is baked into the stored file, not just a CSS overlay.

const WATERMARK_TEXT = "oaksandbims.com";
const MAX_DIMENSION = 2400; // px — resize very large images before storing
const JPEG_QUALITY = 0.9;

export function processPropertyImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // ── Resize to MAX_DIMENSION on the longest side ──────────────────────
      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }

      ctx.drawImage(img, 0, 0, width, height);

      // ── Watermark ─────────────────────────────────────────────────────────
      const fontSize = Math.max(Math.round(width * 0.028), 13);
      ctx.font = `600 ${fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = "right";
      ctx.textBaseline = "bottom";

      const pad = Math.round(fontSize * 0.65);           // outer padding from edge
      const bgPad = Math.round(fontSize * 0.3);          // inner pill padding
      const textW = ctx.measureText(WATERMARK_TEXT).width;
      const pillH = Math.round(fontSize * 1.5);
      const pillW = textW + bgPad * 2;
      const pillX = width - pad - pillW;
      const pillY = height - pad - pillH;
      const r = pillH / 2;                               // fully-rounded ends

      // Dark translucent pill background
      ctx.fillStyle = "rgba(0,0,0,0.48)";
      ctx.beginPath();
      ctx.moveTo(pillX + r, pillY);
      ctx.arcTo(pillX + pillW, pillY, pillX + pillW, pillY + pillH, r);
      ctx.arcTo(pillX + pillW, pillY + pillH, pillX, pillY + pillH, r);
      ctx.arcTo(pillX, pillY + pillH, pillX, pillY, r);
      ctx.arcTo(pillX, pillY, pillX + pillW, pillY, r);
      ctx.closePath();
      ctx.fill();

      // White text centred in the pill
      ctx.fillStyle = "rgba(255,255,255,0.93)";
      ctx.fillText(
        WATERMARK_TEXT,
        width - pad - bgPad,
        height - pad - Math.round((pillH - fontSize) / 2)
      );

      // ── Export ────────────────────────────────────────────────────────────
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
          resolve(new File([blob], `${baseName}.jpg`, { type: "image/jpeg" }));
        },
        "image/jpeg",
        JPEG_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // fall back to original if anything goes wrong
    };

    img.src = objectUrl;
  });
}
