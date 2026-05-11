import { Skeleton } from "@/components/ui/skeleton";

interface ScanSkeletonProps {
  owner: string;
  repo: string;
}

export function ScanSkeleton({ owner, repo }: ScanSkeletonProps) {
  return (
    <div className="mt-10 space-y-6 sm:space-y-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="font-mono text-xs text-dl-fg-muted">
            Scanning <span className="text-dl-fg">{owner}/{repo}</span>…
          </p>
          <Skeleton className="h-7 w-56 sm:h-8 sm:w-72" />
          <Skeleton className="h-4 w-full max-w-sm" />
        </div>
        <Skeleton className="h-10 w-36 shrink-0" />
      </div>

      <div className="grid gap-6 rounded-xl border border-dl-border bg-dl-surface p-6 sm:p-8 md:grid-cols-[auto,1fr] md:items-center">
        <div className="flex justify-center">
          <Skeleton className="h-40 w-40 rounded-full sm:h-[200px] sm:w-[200px]" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>

      <div className="rounded-xl border border-dl-border bg-dl-surface p-6 sm:p-8">
        <Skeleton className="mb-6 h-3 w-20" />
        <div className="space-y-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-dl-border bg-dl-surface p-6 sm:p-8">
        <Skeleton className="mb-6 h-3 w-32" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
