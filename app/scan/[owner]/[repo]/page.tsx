import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { ScanForm } from "@/components/scan/scan-form";
import { ScoreRing } from "@/components/scan/score-ring";
import { Breakdown } from "@/components/scan/breakdown";
import { Signals } from "@/components/scan/signals";
import { RepoStats } from "@/components/scan/repo-stats";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchCommitActivity,
  fetchIssueActivity,
  fetchReleaseActivity,
  fetchRepoMetadata,
} from "@/lib/github";
import { buildSignals, classifyRisk, computeScore } from "@/lib/scoring";
import type { HealthReport } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 600;

interface PageProps {
  params: { owner: string; repo: string };
}

export async function generateMetadata({ params }: PageProps) {
  return {
    title: `${params.owner}/${params.repo} — DriftLogg health check`,
    description: `Drift health report for ${params.owner}/${params.repo}.`,
  };
}

async function loadReport(owner: string, repo: string): Promise<HealthReport | { error: string; status?: number }> {
  try {
    const metadata = await fetchRepoMetadata(owner, repo);
    const [commits, issues, releases] = await Promise.all([
      fetchCommitActivity(owner, repo),
      fetchIssueActivity(owner, repo),
      fetchReleaseActivity(owner, repo),
    ]);
    const { score, breakdown } = computeScore(metadata, commits, issues, releases);
    const risk = classifyRisk(score, metadata);
    const signals = buildSignals(metadata, commits, issues, releases);
    return {
      metadata,
      commits,
      issues,
      releases,
      score,
      breakdown,
      risk,
      signals,
      scannedAt: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const status = (err as { status?: number })?.status;
    if (status === 404) return { error: "Repository not found or private.", status: 404 };
    if (status === 403)
      return { error: "GitHub rate limit hit. Set GITHUB_TOKEN to continue.", status: 403 };
    return {
      error: err instanceof Error ? err.message : "Unexpected error.",
      status: status ?? 500,
    };
  }
}

export default async function ScanResultsPage({ params }: PageProps) {
  const result = await loadReport(params.owner, params.repo);

  if ("error" in result) {
    if (result.status === 404) notFound();
    return (
      <>
        <Navbar />
        <main className="container py-16">
          <div className="mx-auto max-w-2xl space-y-6 text-center">
            <h1 className="text-3xl font-bold">Could not scan this repo</h1>
            <p className="text-muted-foreground">{result.error}</p>
            <Button asChild>
              <Link href="/scan">Try another repo</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const report = result;

  return (
    <>
      <Navbar />
      <main className="container space-y-10 py-10">
        <div className="space-y-4">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link href="/scan">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Scan another repo
            </Link>
          </Button>
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                {report.metadata.fullName}
              </h1>
              {report.metadata.description && (
                <p className="max-w-2xl text-muted-foreground">
                  {report.metadata.description}
                </p>
              )}
            </div>
            <Button asChild variant="outline">
              <a href={report.metadata.url} target="_blank" rel="noreferrer">
                View on GitHub
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Drift score</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ScoreRing score={report.score} risk={report.risk} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Score breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Breakdown breakdown={report.breakdown} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Repository at a glance</CardTitle>
          </CardHeader>
          <CardContent>
            <RepoStats report={report} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Signals worth noting</CardTitle>
          </CardHeader>
          <CardContent>
            <Signals signals={report.signals} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scan another repo</CardTitle>
          </CardHeader>
          <CardContent>
            <ScanForm />
          </CardContent>
        </Card>

        <p className="text-right text-xs text-muted-foreground">
          Scanned {new Date(report.scannedAt).toLocaleString()}
        </p>
      </main>
      <Footer />
    </>
  );
}
