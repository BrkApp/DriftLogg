import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CallToAction() {
  return (
    <section className="container py-24">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-2xl border bg-secondary/40 p-10 text-center md:p-16">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          Scan a repository now
        </h2>
        <p className="max-w-xl text-muted-foreground">
          Paste any public GitHub repo and get a drift score, contributor health,
          release freshness, and the signals that matter — in seconds.
        </p>
        <Button asChild size="lg">
          <Link href="/scan">
            Try the health check
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
