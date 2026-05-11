import { ExternalLink, Github } from "lucide-react";

interface RepoHeaderProps {
  fullName: string;
  description: string | null;
  url: string;
  scannedAt: string;
}

export function RepoHeader({ fullName, description, url, scannedAt }: RepoHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        <h1 className="break-words font-mono text-xl font-bold tracking-tight text-dl-fg sm:text-2xl md:text-3xl">
          {fullName}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-dl-fg-muted sm:text-base">{description}</p>
        )}
        <p className="mt-2 font-mono text-xs text-dl-fg-muted">
          scanned on {new Date(scannedAt).toLocaleString("en-US")}
        </p>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md border border-dl-border px-4 font-mono text-xs text-dl-fg transition-colors hover:border-dl-fg-muted/40"
      >
        <Github className="h-4 w-4" /> View on GitHub
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}
