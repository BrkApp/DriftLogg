/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data:",
      "connect-src 'self' https://va.vercel-scripts.com",
    ].join("; "),
  },
];

const nextConfig = {
  // Locally (no GITHUB_TOKEN), /is/[slug] pages can be slow due to rate limits.
  // In production on Vercel the token is set and calls complete in < 1s.
  staticPageGenerationTimeout: 180,
  async headers() {
    return [
      {
        // Exclude sitemap and robots from security headers so crawlers aren't affected
        source: "/((?!sitemap\\.xml|robots\\.txt).*)",
        headers: securityHeaders,
      },
    ];
  },
  transpilePackages: [
    "react-markdown",
    "remark-parse",
    "remark-rehype",
    "unified",
    "bail",
    "is-plain-obj",
    "trough",
    "vfile",
    "vfile-message",
    "unist-util-stringify-position",
    "mdast-util-from-markdown",
    "mdast-util-to-hast",
    "mdast-util-to-string",
    "mdast-util-definitions",
    "micromark",
    "unist-util-visit",
    "unist-util-visit-parents",
    "unist-util-is",
    "hast-util-whitespace",
    "property-information",
    "space-separated-tokens",
    "comma-separated-tokens",
  ],
};

export default nextConfig;
