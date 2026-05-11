import Link from "next/link";
import { Layout } from "@/components/shared/Layout";
import { ScanInput } from "@/components/shared/ScanInput";

type Tone = "green" | "red" | "orange" | "amber";

const SUGGESTIONS: Array<{ slug: string; tone: Tone }> = [
  { slug: "facebook/react", tone: "green" },
  { slug: "moment/moment", tone: "red" },
  { slug: "lodash/lodash", tone: "orange" },
  { slug: "vercel/next.js", tone: "green" },
  { slug: "request/request", tone: "red" },
  { slug: "expressjs/express", tone: "amber" },
];

const DOT: Record<Tone, string> = {
  green: "bg-dl-green",
  red: "bg-dl-red",
  orange: "bg-dl-orange",
  amber: "bg-dl-amber",
};

export default function ScanPage() {
  return (
    <Layout>
      <section className="mx-auto flex min-h-[calc(100vh-160px)] w-full max-w-xl flex-col justify-center px-4 py-16 sm:px-6">
        <h1 className="text-[36px] font-bold leading-tight tracking-tight text-dl-fg">
          Check any repo
        </h1>
        <p className="mt-3 text-base text-dl-fg-muted">
          Paste a GitHub repository and get a health score in seconds.
        </p>

        <div className="mt-8">
          <ScanInput size="lg" placeholder="owner/repo" autoFocus />
        </div>

        <div className="mt-10 space-y-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-dl-fg-muted">
            Try these
          </p>
          <ul className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/scan/${s.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-dl-border bg-dl-surface px-3 py-1.5 font-mono text-xs text-dl-fg transition-colors hover:border-dl-green"
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${DOT[s.tone]}`}
                    aria-hidden
                  />
                  {s.slug}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </Layout>
  );
}
