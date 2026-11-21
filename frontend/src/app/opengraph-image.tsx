import { ImageResponse } from "next/og";

export const alt = "CodeTruth: style checkers read words, CodeTruth reads the product";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#ffffff", padding: 72, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "#1f5bd0", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 38, fontWeight: 700 }}>✓</div>
          <div style={{ fontSize: 40, fontWeight: 700, color: "#0b1426" }}>CodeTruth</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 68, fontWeight: 700, color: "#0b1426", lineHeight: 1.08, letterSpacing: -1.5 }}>Style checkers read words.</div>
          <div style={{ fontSize: 68, fontWeight: 700, color: "#1f5bd0", lineHeight: 1.08, letterSpacing: -1.5 }}>CodeTruth reads the product.</div>
        </div>
        <div style={{ fontSize: 28, color: "#4b5b7a" }}>Verify every product claim against what your product actually does.</div>
      </div>
    ),
    size,
  );
}
