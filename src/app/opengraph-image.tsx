import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "VOCK — استوديو تصوير في مدينة نصر";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0a 0%, #2a0d08 55%, #e8481c 100%)",
        }}
      >
        <div style={{ display: "flex", fontSize: 130, fontWeight: 900, color: "white", letterSpacing: -4 }}>
          VOCK<span style={{ color: "#f2900f" }}>©</span>
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#e5e5e5", marginTop: 20, letterSpacing: 4 }}>
          PHOTOGRAPHY STUDIO · NASR CITY, CAIRO
        </div>
      </div>
    ),
    { ...size }
  );
}
