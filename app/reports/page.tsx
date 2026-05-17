import Link from "next/link";
import { Layout } from "@/components/shared/Layout";
import { getAllReports } from "@/lib/reports";
import { EmailCapture } from "@/components/shared/EmailCapture";

export const metadata = {
  title: "Risk Reports — DriftLogg",
  description:
    "Every week, we scan the 50 most popular packages and publish what we find.",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ReportsPage() {
  const reports = getAllReports();

  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-14">
          <h1 className="text-[42px] font-bold leading-tight tracking-tight text-dl-fg">
            Risk Reports
          </h1>
          <p className="mt-3 text-base text-dl-fg-muted">
            Every week, we scan the 50 most popular packages and publish what we
            find.
          </p>
        </div>

        {reports.length === 0 ? (
          <p className="font-mono text-sm text-dl-fg-muted">
            No reports published yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <Link
                key={report.slug}
                href={`/reports/${report.slug}`}
                className="group flex flex-col rounded-xl border border-dl-border bg-dl-surface p-5 transition-colors hover:border-dl-green"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="font-mono text-[11px] text-dl-fg-muted">
                    {formatDate(report.date)}
                  </span>
                  {report.tags.slice(0, 1).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-dl-border px-2 py-0.5 font-mono text-[11px] text-dl-fg-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h2 className="mb-2 text-[17px] font-bold leading-snug text-dl-fg">
                  {report.title}
                </h2>

                <p className="line-clamp-2 flex-1 text-[13.5px] leading-relaxed text-dl-fg-muted">
                  {report.description}
                </p>

                <span className="mt-4 font-mono text-[13px] text-dl-green">
                  Read report →
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* ── Newsletter capture ───────────────────────────────────── */}
        <div className="mt-20 border-t border-dl-border pt-16">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-dl-green">
            {"// dead package weekly"}
          </p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-dl-fg sm:text-[28px]">
            Get the report in your inbox every Monday.
          </h2>
          <p className="mt-3 max-w-xl text-base text-dl-fg-muted">
            We scan the 50 most depended-on npm packages every week. Subscribe
            and we&apos;ll send you the ones heading toward abandonment before your
            build notices.
          </p>
          <div className="mt-6 max-w-md">
            <EmailCapture variant="inline" buttonLabel="Subscribe free" />
          </div>
        </div>
      </div>
    </Layout>
  );
}
