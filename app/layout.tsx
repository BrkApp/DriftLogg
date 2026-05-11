import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
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
  title: "DriftLogg — Open Source Decay Radar",
  description:
    "Predict which open source packages will lose maintainers before your production build breaks. Free health check for any GitHub repo.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "DriftLogg — Open Source Decay Radar",
    description:
      "Predict open source decay before it hits production. Free health check on any public GitHub repo.",
    type: "website",
    url: "https://driftlogg.dev",
    siteName: "DriftLogg",
  },
  twitter: {
    card: "summary_large_image",
    title: "DriftLogg — Open Source Decay Radar",
    description:
      "Predict open source decay before it hits production. Free health check on any public GitHub repo.",
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-dl-bg font-sans text-dl-fg antialiased">
        {children}
      </body>
    </html>
  );
}
