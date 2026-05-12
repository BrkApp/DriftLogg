import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DriftLogg — Open Source Health Monitoring",
  description:
    "The Snyk Advisor replacement. DriftLogg monitors open source package health, predicts decay before it hits production, and suggests alternatives when a dependency starts declining.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "DriftLogg — Open Source Health Monitoring",
    description:
      "Continuous health monitoring and decay prediction for every dependency your team ships. Free health check for any public GitHub repo.",
    type: "website",
    url: "https://driftlogg.dev",
    siteName: "DriftLogg",
  },
  twitter: {
    card: "summary_large_image",
    title: "DriftLogg — Open Source Health Monitoring",
    description:
      "Continuous health monitoring and decay prediction for every dependency your team ships.",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "DriftLogg",
  description:
    "Open source health monitoring and decay prediction for engineering teams.",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  url: "https://driftlogg.dev",
  offers: [
    { "@type": "Offer", price: "0", priceCurrency: "EUR", name: "Free" },
    { "@type": "Offer", price: "29", priceCurrency: "EUR", name: "Pro" },
    { "@type": "Offer", price: "99", priceCurrency: "EUR", name: "Team" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-dl-bg font-sans text-dl-fg antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
