/**
 * Curated list of popular npm packages used to pre-generate
 * /is/[name]-maintained landing pages at build time.
 *
 * Source: npm most-depended-on + libraries.io ranking.
 * Scoped packages are slugified for URLs:
 *  "@nestjs/core" -> "nestjs-core"
 *
 * PyPI (and other ecosystems) will be added in a follow-up sprint
 * once we have validated the page template in production.
 */

export type Ecosystem = "npm";

export interface KnownPackage {
  ecosystem: Ecosystem;
  /** Canonical package name as registered on the registry. */
  name: string;
  /** URL slug used in /is/[slug]-maintained. */
  slug: string;
}

function slugifyNpm(name: string): string {
  return name.replace(/^@/, "").replace(/[/.]/g, "-").toLowerCase();
}

const NPM_NAMES: string[] = [
  "react",          "next",            "vue",              "@angular/core",   "svelte",
  "remix",          "astro",           "nuxt",             "@nestjs/core",    "fastify",
  "express",        "koa",             "hapi",             "axios",           "node-fetch",
  "got",            "ky",              "lodash",           "underscore",      "ramda",
  "moment",         "date-fns",        "dayjs",            "luxon",           "webpack",
  "vite",           "rollup",          "parcel",           "esbuild",         "turbopack",
  "typescript",     "tailwindcss",     "postcss",          "sass",            "less",
  "prisma",         "drizzle-orm",     "sequelize",        "mongoose",        "typeorm",
  "knex",           "jest",            "mocha",            "vitest",          "cypress",
  "playwright",     "puppeteer",       "eslint",           "prettier",        "@babel/core",
  "pnpm",           "yarn",            "npm",              "lerna",           "nx",
  "turbo",          "gulp",            "grunt",            "socket.io",       "ws",
  "redux",          "mobx",            "zustand",          "pinia",           "jotai",
  "recoil",         "react-query",     "swr",              "react-router",    "@tanstack/react-query",
  "graphql",        "apollo-server",   "@apollo/client",   "trpc",            "@trpc/server",
  "chalk",          "commander",       "yargs",            "inquirer",        "ora",
  "dotenv",         "cors",            "helmet",           "morgan",          "nodemon",
  "pm2",            "winston",         "pino",             "bunyan",          "debug",
  "cheerio",        "jsdom",           "marked",           "remark",          "mdx",
  "next-auth",      "passport",        "jsonwebtoken",     "bcrypt",          "argon2",
];

export const KNOWN_PACKAGES: KnownPackage[] = NPM_NAMES.map((name) => ({
  ecosystem: "npm" as const,
  name,
  slug: slugifyNpm(name),
}));

const BY_SLUG = new Map<string, KnownPackage>(
  KNOWN_PACKAGES.map((p) => [p.slug, p])
);

export function findPackageBySlug(slug: string): KnownPackage | undefined {
  return BY_SLUG.get(slug.toLowerCase());
}
