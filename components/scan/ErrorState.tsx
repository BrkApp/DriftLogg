import Link from "next/link";
import { RefreshCw, XCircle } from "lucide-react";

interface ErrorStateProps {
  message: string;
  owner: string;
  repo: string;
  onRetry: () => void;
}

export function ErrorState({ message, owner, repo, onRetry }: ErrorStateProps) {
  const isRateLimit = /rate limit|retry in|429/i.test(message);
  return (
    <div className="mt-10 animate-fade-in rounded-xl border border-dl-red/40 bg-dl-red/5 p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-dl-red" />
        <div>
          <p className="font-semibold text-dl-fg">
            Could not scan {owner}/{repo}
          </p>
          <p className="mt-1 text-sm text-dl-fg-muted">{message}</p>
          {isRateLimit && (
            <p className="mt-2 font-mono text-xs text-dl-fg-muted">
              Set{" "}
              <code className="rounded bg-dl-bg px-1 py-0.5">GITHUB_TOKEN</code>{" "}
              server-side to raise the limit to 5,000 req/h.
            </p>
          )}
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-dl-border px-4 font-mono text-sm text-dl-fg transition-colors hover:border-dl-fg-muted/40"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-dl-green px-4 font-mono text-sm font-semibold text-black hover:bg-dl-green/90"
        >
          Scan another repo
        </Link>
      </div>
    </div>
  );
}
