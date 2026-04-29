import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Oaks & Bims Nigeria Limited — Real Estate Across Nigeria";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(140deg, #0c4228 0%, #0f5132 50%, #166534 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "64px 80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Logo + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              background: "white",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "34px",
              fontWeight: "800",
              color: "#0f5132",
              fontFamily: "Georgia, serif",
            }}
          >
            O
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <span
              style={{
                color: "white",
                fontSize: "26px",
                fontWeight: "700",
                lineHeight: "1",
                letterSpacing: "-0.01em",
              }}
            >
              Oaks &amp; Bims
            </span>
            <span
              style={{
                color: "rgba(255,255,255,0.55)",
                fontSize: "13px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Nigeria Limited
            </span>
          </div>
        </div>

        {/* Main headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div
            style={{
              color: "white",
              fontSize: "58px",
              fontWeight: "700",
              lineHeight: "1.1",
              letterSpacing: "-0.025em",
              maxWidth: "960px",
            }}
          >
            Prime Property Across All 36 States of Nigeria
          </div>
          <div
            style={{
              display: "flex",
              gap: "32px",
              color: "rgba(255,255,255,0.65)",
              fontSize: "20px",
            }}
          >
            <span>✓ Verified titles</span>
            <span>✓ Transparent pricing</span>
            <span>✓ Diaspora-friendly</span>
          </div>
        </div>

        {/* Domain */}
        <div
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: "17px",
            letterSpacing: "0.06em",
            textTransform: "lowercase",
          }}
        >
          oaksandbims.com
        </div>
      </div>
    ),
    { ...size }
  );
}
