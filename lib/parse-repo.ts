/** Parses a GitHub URL or "owner/repo" slug into a validated { owner, repo } pair. */

import { OWNER_RE, REPO_RE, OWNER_MAX, REPO_MAX } from "./constants";

function validateParts(owner: string, repo: string): { owner: string; repo: string } | null {
  if (!owner || !repo) return null;
  if (owner.length > OWNER_MAX || repo.length > REPO_MAX) return null;
  if (!OWNER_RE.test(owner) || !REPO_RE.test(repo)) return null;
  return { owner, repo };
}

export function parseRepoInput(input: string): { owner: string; repo: string } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const urlMatch = trimmed.match(
    /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^/\s]+)\/([^/\s#?]+)/i
  );
  if (urlMatch) {
    return validateParts(urlMatch[1], urlMatch[2].replace(/\.git$/, ""));
  }

  const slugMatch = trimmed.match(/^([^/\s]+)\/([^/\s]+)$/);
  if (slugMatch) {
    return validateParts(slugMatch[1], slugMatch[2].replace(/\.git$/, ""));
  }

  return null;
}
