import { MetadataRoute } from "next";
import { KNOWN_PACKAGES } from "@/lib/packages-list";
import { getAllReports } from "@/lib/reports";

const SITE = "https://driftlogg.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE,                                  lastModified: now, changeFrequency: "weekly",  priority: 1   },
    { url: `${SITE}/scan`,                        lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/reports`,                     lastModified: now, changeFrequency: "weekly",  priority: 0.7 },
    { url: `${SITE}/alternative-to-snyk-advisor`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE}/methodology`,                 lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  const packagePages: MetadataRoute.Sitemap = KNOWN_PACKAGES.map((p) => ({
    url: `${SITE}/is/${p.slug}-maintained`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  const reportPages: MetadataRoute.Sitemap = getAllReports().map((r) => ({
    url: `${SITE}/reports/${r.slug}`,
    lastModified: new Date(r.date),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticPages, ...packagePages, ...reportPages];
}
