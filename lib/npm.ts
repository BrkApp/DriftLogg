/**
 * Minimal npm -> GitHub resolver.
 * Used at build time to map npm package names to owner/repo
 * so /is/[name]-maintained pages can run our scoring.
 */

interface NpmRegistryResponse {
  repository?: { url?: string; type?: string };
}

const GITHUB_RE = /github\.com[:/]([^/\s]+?)\/([^/\s.#?]+?)(?:\.git)?(?:[/#?].*)?$/i;
const SHORT_RE = /^github:([^/]+)\/([^/#.]+)/;

export async function resolveNpmToGithub(
  pkg: string
): Promise<{ owner: string; repo: string } | null> {
  try {
    const res = await fetch(`https://registry.npmjs.org/${encodeURIComponent(pkg)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as NpmRegistryResponse;
    const url = data.repository?.url;
    if (!url) return null;
    const short = url.match(SHORT_RE);
    if (short) return { owner: short[1], repo: short[2] };
    const full = url.match(GITHUB_RE);
    if (full) return { owner: full[1], repo: full[2] };
    return null;
  } catch {
    return null;
  }
}
