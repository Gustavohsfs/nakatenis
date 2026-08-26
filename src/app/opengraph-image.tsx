import { ImageResponse } from "next/og";

export const alt = "NakaTenis — raquetes, calçados e roupas de tênis e beach tennis";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0B2545 0%, #12406E 55%, #1B6CA8 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "#F2A93B",
              display: "flex",
            }}
          />
          <div style={{ fontSize: 46, fontWeight: 700, display: "flex" }}>
            Naka<span style={{ color: "#F2A93B" }}>Tenis</span>
          </div>
        </div>

        <div
          style={{
            marginTop: 48,
            fontSize: 62,
            fontWeight: 700,
            lineHeight: 1.1,
            maxWidth: 900,
            display: "flex",
          }}
        >
          Raquetes, calçados e roupas de tênis e beach tennis
        </div>

        <div
          style={{
            marginTop: 28,
            fontSize: 30,
            color: "#C6DDF0",
            maxWidth: 880,
            display: "flex",
          }}
        >
          Santa Fé do Sul/SP · Pedido fechado pelo WhatsApp
        </div>
      </div>
    ),
    size,
  );
}
