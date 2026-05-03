"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { stateCoordWithJitter, NIGERIA_CENTER } from "@/lib/nigeria-coordinates";
import { formatMoney } from "@/lib/currency";
import type { Property } from "@/lib/types";

// Purpose-specific pin colours
const PURPOSE_COLOR: Record<string, string> = {
  sale:     "#15803d", // emerald-700
  rent:     "#2563eb", // blue-600
  shortlet: "#7c3aed", // violet-600
};

function makeIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 24 32">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 20 12 20S24 21 24 12C24 5.373 18.627 0 12 0z"
        fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>`,
    iconSize:    [24, 32],
    iconAnchor:  [12, 32],
    popupAnchor: [0, -34],
  });
}

const ICONS: Record<string, L.DivIcon> = {
  sale:     makeIcon(PURPOSE_COLOR.sale),
  rent:     makeIcon(PURPOSE_COLOR.rent),
  shortlet: makeIcon(PURPOSE_COLOR.shortlet),
};

export function MapView({ properties }: { properties: Property[] }) {
  return (
    <MapContainer
      center={NIGERIA_CENTER}
      zoom={6}
      scrollWheelZoom
      className="w-full rounded-xl"
      style={{ height: "calc(100vh - 280px)", minHeight: 500 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {properties.map((p) => {
        const [lat, lng] = stateCoordWithJitter(p.state, p.id);
        const price = formatMoney(p.price_ngn, "NGN");
        const icon = ICONS[p.purpose] ?? ICONS.sale;

        return (
          <Marker key={p.id} position={[lat, lng]} icon={icon}>
            <Popup>
              <div style={{ width: 210, fontFamily: "system-ui, sans-serif" }}>
                {p.cover_image_url && (
                  <img
                    src={p.cover_image_url}
                    alt={p.title}
                    style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: "4px 4px 0 0", display: "block" }}
                  />
                )}
                <div style={{ padding: "10px 10px 6px" }}>
                  <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>{p.title}</div>
                  <div style={{ color: "#6b7280", fontSize: 11, marginTop: 3 }}>
                    {p.city}, {p.state}
                  </div>
                  <div style={{ color: "#15803d", fontWeight: 700, fontSize: 15, marginTop: 6 }}>
                    {price}
                  </div>
                  <a
                    href={`/properties/${p.slug}`}
                    style={{
                      display: "block",
                      marginTop: 8,
                      padding: "6px 0",
                      background: "#15803d",
                      color: "white",
                      textAlign: "center",
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    View property →
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
