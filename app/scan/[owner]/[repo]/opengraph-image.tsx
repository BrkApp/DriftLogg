import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage({
  params,
}: {
  params: { owner: string; repo: string };
}) {
  const { owner, repo } = params;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0d1117",
          padding: "60px 72px",
          fontFamily: "monospace",
        }}
      >
        {/* top bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: "#00ff88",
            }}
          />
          <span style={{ color: "#00ff88", fontSize: 16, letterSpacing: "0.2em" }}>
            DRIFTLOGG
          </span>
        </div>

        {/* center */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <span
            style={{
              color: "#4b5563",
              fontSize: 18,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Open Source Health Check
          </span>
          <span
            style={{
              color: "#f0f6fc",
              fontSize: 58,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
            }}
          >
            {owner}/{repo}
          </span>
        </div>

        {/* bottom */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ color: "#4b5563", fontSize: 16 }}>
            driftlogg.dev/scan/{owner}/{repo}
          </span>
          <span style={{ color: "#4b5563", fontSize: 16 }}>
            6 signals · score 0–100
          </span>
        </div>
      </div>
    ),
    size
  );
}
