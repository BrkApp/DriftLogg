import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Layout } from "@/components/shared/Layout";
import { ReportMarkdown } from "@/components/shared/ReportMarkdown";
import { EmailCapture } from "@/components/shared/EmailCapture";
import { getAllReports, getReport } from "@/lib/reports";
import { ShareButtons } from "./ShareButtons";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllReports().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const report = getReport(params.slug);
  if (!report) return {};
  return {
    title: `${report.title} — DriftLogg`,
    description: report.description,
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ReportPage({ params }: Props) {
  const report = getReport(params.slug);
  if (!report) notFound();

  return (
    <Layout>
      <article className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <header className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <span className="font-mono text-[11px] uppercase tracking-widest text-dl-fg-muted">
              {formatDate(report.date)}
            </span>
            {report.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-dl-border px-2.5 py-0.5 font-mono text-[11px] text-dl-fg-muted"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-[36px] font-bold leading-tight tracking-tight text-dl-fg">
            {report.title}
          </h1>

          <hr className="mt-6 border-dl-border" />
        </header>

        <div>
          <ReportMarkdown content={report.content} />
        </div>

        <footer className="mt-16 space-y-10">
          <div className="rounded-xl border border-dl-border bg-dl-surface p-6 text-center">
            <Link
              href="/scan"
              className="inline-flex items-center gap-2 rounded-lg bg-dl-green px-6 py-3 font-mono text-sm font-bold text-black transition-opacity hover:opacity-90"
            >
              Scan your own repo for free →
            </Link>
          </div>

          <ShareButtons title={report.title} slug={report.slug} />

          <div className="pt-2">
            <EmailCapture variant="full" />
          </div>
        </footer>
      </article>
    </Layout>
  );
}
