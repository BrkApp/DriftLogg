"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Layout } from "@/components/shared/Layout";
import { ScanSkeleton } from "@/components/scan/ScanSkeleton";
import { ErrorState } from "@/components/scan/ErrorState";
import { ScanResults } from "@/components/scan/ScanResults";
import type { ScanApiResponse } from "@/lib/types";
import { OWNER_MAX, OWNER_RE, REPO_MAX, REPO_RE } from "@/lib/constants";

export default function ScanResultsPage({
  params,
}: {
  params: { owner: string; repo: string };
}) {
  const { owner, repo } = params;
  const [report, setReport] = useState<ScanApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const runScan = useCallback(() => {
    if (
      owner.length > OWNER_MAX ||
      !OWNER_RE.test(owner) ||
      repo.length > REPO_MAX ||
      !REPO_RE.test(repo)
    ) {
      setError("Invalid repository path.");
      setLoading(false);
      return;
    }
    setReport(null);
    setError(null);
    setLoading(true);
    fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ owner, repo }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error((json as { error?: string }).error ?? "Unknown error.");
        return json as ScanApiResponse;
      })
      .then((data) => {
        setReport(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [owner, repo]);

  useEffect(() => {
    runScan();
  }, [runScan]);

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-xs text-dl-fg-muted hover:text-dl-fg"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> back
        </Link>
        {loading && <ScanSkeleton owner={owner} repo={repo} />}
        {!loading && error && (
          <ErrorState message={error} owner={owner} repo={repo} onRetry={runScan} />
        )}
        {!loading && report && <ScanResults report={report} />}
      </div>
    </Layout>
  );
}
