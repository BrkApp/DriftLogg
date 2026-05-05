import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DriftLogg — Predict open source decline before it bites",
  description:
    "DriftLogg analyzes commit cadence, issue triage, releases, and contributor health to predict which open source packages are drifting toward abandonment.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
