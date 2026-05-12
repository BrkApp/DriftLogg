/**
 * Curated mapping of npm packages -> compatible alternatives.
 * Used on /is/[name]-maintained pages when the source package
 * shows a low health score.
 *
 * Each alternative references another package by its slug so
 * /is/[alt-slug]-maintained pages can be linked directly.
 */

export interface Alternative {
  slug: string;
  name: string;
  why: string;
}

interface AlternativeEntry {
  slug: string;
  alternatives: Alternative[];
}

export const ALTERNATIVES: AlternativeEntry[] = [
  {
    slug: "moment",
    alternatives: [
      { slug: "date-fns", name: "date-fns",  why: "Immutable, tree-shakeable, no global state." },
      { slug: "dayjs",    name: "dayjs",     why: "Same API as moment, 2 kB instead of 70 kB." },
      { slug: "luxon",    name: "luxon",     why: "Modern API by a former moment maintainer." },
    ],
  },
  {
    slug: "request",
    alternatives: [
      { slug: "axios",      name: "axios",      why: "Promise-based HTTP client, very widely used." },
      { slug: "got",        name: "got",        why: "Smaller, simpler, retries built in." },
      { slug: "node-fetch", name: "node-fetch", why: "fetch() polyfill for Node, minimal API." },
    ],
  },
  {
    slug: "gulp",
    alternatives: [
      { slug: "vite",    name: "vite",    why: "Modern build tool with HMR and ESM-first." },
      { slug: "esbuild", name: "esbuild", why: "100x faster than legacy task runners." },
      { slug: "parcel",  name: "parcel",  why: "Zero-config bundler with sensible defaults." },
    ],
  },
  {
    slug: "grunt",
    alternatives: [
      { slug: "gulp",    name: "gulp",    why: "If you still want a task runner, gulp is more active." },
      { slug: "vite",    name: "vite",    why: "Modern alternative; replaces most build pipelines." },
      { slug: "esbuild", name: "esbuild", why: "Ultra-fast bundler, drop-in for most use cases." },
    ],
  },
  {
    slug: "underscore",
    alternatives: [
      { slug: "lodash", name: "lodash", why: "Drop-in replacement, more functions, better performance." },
      { slug: "ramda",  name: "ramda",  why: "Functional-first, curried by default." },
    ],
  },
  {
    slug: "bower",
    alternatives: [
      { slug: "npm",  name: "npm",  why: "The standard package manager for JS." },
      { slug: "yarn", name: "yarn", why: "Faster install, workspaces support." },
      { slug: "pnpm", name: "pnpm", why: "Disk-efficient, strict by default." },
    ],
  },
  {
    slug: "node-sass",
    alternatives: [
      { slug: "sass", name: "sass (Dart Sass)", why: "Officially endorsed replacement. Pure JS, no node-gyp." },
    ],
  },
  {
    slug: "chai",
    alternatives: [
      { slug: "vitest", name: "vitest", why: "Modern testing with built-in expect API." },
      { slug: "jest",   name: "jest",   why: "Industry standard with rich matcher library." },
    ],
  },
  {
    slug: "mocha",
    alternatives: [
      { slug: "vitest", name: "vitest", why: "Faster, ESM-native, Jest-compatible API." },
      { slug: "jest",   name: "jest",   why: "Ships with assertions, mocking, coverage out of the box." },
    ],
  },
];

const BY_SLUG = new Map<string, Alternative[]>(
  ALTERNATIVES.map((e) => [e.slug, e.alternatives])
);

export function getAlternativesFor(slug: string): Alternative[] {
  return BY_SLUG.get(slug.toLowerCase()) ?? [];
}
