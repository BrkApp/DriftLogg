import { ImageResponse } from "next/og";
import { findPackageBySlug } from "@/lib/packages-list";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SUFFIX = "-maintained";

export default function OGImage({
  params,
}: {
  params: { slug: string };
}) {
  const base = params.slug.endsWith(SUFFIX)
    ? params.slug.slice(0, -SUFFIX.length)
    : params.slug;
  const pkg = findPackageBySlug(base);
  const pkgName = pkg?.name ?? base;

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
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: "#00ff88",
            }}
          />
          <span
            style={{ color: "#00ff88", fontSize: 16, letterSpacing: "0.2em" }}
          >
            DRIFTLOGG
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <span
            style={{
              color: "#4b5563",
              fontSize: 22,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Open Source Health Check
          </span>
          <span
            style={{
              color: "#f0f6fc",
              fontSize: 96,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            Is {pkgName} maintained?
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ color: "#4b5563", fontSize: 16 }}>
            driftlogg.dev/is/{params.slug}
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
