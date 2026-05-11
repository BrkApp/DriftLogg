import { Github, Mail, Twitter } from "lucide-react";

const LINKS = [
  { href: "https://github.com", label: "GitHub", Icon: Github },
  { href: "https://twitter.com", label: "Twitter", Icon: Twitter },
  { href: "mailto:hi@driftlogg.dev", label: "Email", Icon: Mail },
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
              Built for engineering teams who&apos;ve been burned before.
            </p>
          </div>
          <nav className="flex items-center gap-5">
            {LINKS.map(({ href, label, Icon }) => (
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
          </nav>
        </div>
        <div className="border-t border-dl-border py-5 text-center">
          <p className="text-xs text-dl-fg-muted">© 2026 DriftLogg</p>
        </div>
      </div>
    </footer>
  );
}
