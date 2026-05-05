export function parseRepoInput(input: string): { owner: string; repo: string } | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const urlMatch = trimmed.match(
    /^(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/\s]+)\/([^\/\s#?]+)/i
  );
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2].replace(/\.git$/, "") };
  }

  const slugMatch = trimmed.match(/^([^\/\s]+)\/([^\/\s]+)$/);
  if (slugMatch) {
    return { owner: slugMatch[1], repo: slugMatch[2].replace(/\.git$/, "") };
  }

  return null;
}
