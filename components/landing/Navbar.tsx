"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Github, Menu, X } from "lucide-react";

const GITHUB_URL = "https://github.com/BrkApp/DriftLogg";

const LINKS: Array<{ href: string; label: string }> = [
  { href: "/#how", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/reports", label: "Reports" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const onScan = pathname?.startsWith("/scan") ?? false;

  return (
    <header className="sticky top-0 z-50 border-b border-dl-border bg-dl-bg/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-mono text-base font-bold tracking-tight text-dl-fg">
            DriftLogg
          </span>
          <span className="h-2 w-2 rounded-full bg-dl-green animate-pulse-dot" aria-hidden />
        </Link>

        <ul className="hidden items-center gap-7 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="font-mono text-xs text-dl-fg-muted transition-colors hover:text-dl-fg"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="DriftLogg on GitHub"
            className="hidden h-8 w-8 items-center justify-center rounded-md text-dl-fg-muted transition-colors hover:text-dl-fg sm:inline-flex"
          >
            <Github className="h-4 w-4" />
          </a>
          <Link
            href="/scan"
            className={`hidden rounded-md border px-3 py-1.5 font-mono text-xs transition-colors sm:inline-flex ${
              onScan
                ? "border-dl-green bg-dl-green/10 text-dl-fg"
                : "border-dl-green/60 text-dl-green hover:bg-dl-green/10"
            }`}
          >
            Scan your repo
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-dl-border text-dl-fg-muted transition-colors hover:text-dl-fg md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-dl-border bg-dl-surface md:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2 font-mono text-sm text-dl-fg-muted transition-colors hover:bg-dl-bg hover:text-dl-fg"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                href="/scan"
                onClick={() => setOpen(false)}
                className={`mt-2 block rounded-md border px-3 py-2 font-mono text-sm transition-colors ${
                  onScan
                    ? "border-dl-green bg-dl-green/10 text-dl-fg"
                    : "border-dl-green/60 text-dl-green hover:bg-dl-green/10"
                }`}
              >
                Scan your repo
              </Link>
            </li>
            <li>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                onClick={() => setOpen(false)}
                className="mt-1 flex items-center gap-2 rounded-md px-3 py-2 font-mono text-sm text-dl-fg-muted transition-colors hover:bg-dl-bg hover:text-dl-fg"
              >
                <Github className="h-4 w-4" /> GitHub
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
