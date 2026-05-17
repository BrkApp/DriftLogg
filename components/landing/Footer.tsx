import Link from "next/link";
import { Github, Mail } from "lucide-react";

const ICON_LINKS = [
  { href: "https://github.com/BrkApp/DriftLogg", label: "GitHub", Icon: Github },
  { href: "mailto:hi@driftlogg.dev", label: "Email", Icon: Mail },
];

const TEXT_LINKS = [
  { href: "/methodology",                label: "Methodology" },
  { href: "/alternative-to-snyk-advisor", label: "vs Snyk Advisor" },
  { href: "/vs/ossf-scorecard",          label: "vs OSSF" },
  { href: "/vs/socket-dev",              label: "vs Socket" },
  { href: "/vs/snyk",                    label: "vs Snyk" },
  { href: "/reports",                    label: "Weekly reports" },
  { href: "/api-docs",                   label: "API" },
];

export function Footer() {
  return (
    <footer className="border-t border-dl-border bg-dl-bg">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-start gap-6 py-10 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-sm font-bold text-dl-fg">
              DriftLogg
            </span>
            <p className="text-[13px] text-dl-fg-muted">
              Used by teams who learned the hard way that &apos;looks maintained&apos; isn&apos;t a strategy.
            </p>
          </div>
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {TEXT_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="font-mono text-xs text-dl-fg-muted transition-colors hover:text-dl-fg"
              >
                {label}
              </Link>
            ))}
            <div className="flex items-center gap-4 pl-2">
              {ICON_LINKS.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noreferrer" : undefined}
                  aria-label={label}
                  className="text-dl-fg-muted transition-colors hover:text-dl-green"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </nav>
        </div>
        <div className="border-t border-dl-border py-5 text-center">
          <p className="text-xs text-dl-fg-muted">© 2026 DriftLogg</p>
        </div>
      </div>
    </footer>
  );
}
