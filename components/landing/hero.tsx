import Link from "next/link";
import { ArrowRight, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="container relative flex flex-col items-center gap-6 py-24 text-center md:py-32">
      <div className="inline-flex items-center gap-2 rounded-full border bg-secondary/40 px-4 py-1.5 text-xs font-medium text-muted-foreground">
        <GitBranch className="h-3.5 w-3.5" />
        Beta — free GitHub health check
      </div>
      <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
        Predict open source decline{" "}
        <span className="bg-gradient-to-r from-amber-500 to-red-500 bg-clip-text text-transparent">
          before it breaks production
        </span>
      </h1>
      <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
        DriftLogg scores the packages your stack depends on across commit cadence, issue
        triage, releases, and contributor signals — so you know what is drifting toward
        abandonment before the next dependency bump.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/scan">
            Run a free health check
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="#how-it-works">How it works</Link>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        No signup. Public repos only. Results in seconds.
      </p>
    </section>
  );
}
