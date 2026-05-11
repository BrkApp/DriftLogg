/** @type {import('next').NextConfig} */
const nextConfig = {
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
