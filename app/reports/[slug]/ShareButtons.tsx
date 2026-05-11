"use client";

import { useState } from "react";
import { Check, Copy, Twitter, Linkedin } from "lucide-react";

interface ShareButtonsProps {
  title: string;
  slug: string;
}

export function ShareButtons({ title, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/reports/${slug}`
      : `https://driftlogg.dev/reports/${slug}`;

  const twitterHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const linkedinHref = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="font-mono text-[11px] uppercase tracking-widest text-dl-fg-muted">
        Share
      </span>

      <a
        href={twitterHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-md border border-dl-border px-3 py-1.5 font-mono text-xs text-dl-fg-muted transition-colors hover:border-dl-fg hover:text-dl-fg"
      >
        <Twitter className="h-3.5 w-3.5" />
        Twitter
      </a>

      <a
        href={linkedinHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-md border border-dl-border px-3 py-1.5 font-mono text-xs text-dl-fg-muted transition-colors hover:border-dl-fg hover:text-dl-fg"
      >
        <Linkedin className="h-3.5 w-3.5" />
        LinkedIn
      </a>

      <button
        type="button"
        onClick={copyLink}
        className="inline-flex items-center gap-1.5 rounded-md border border-dl-border px-3 py-1.5 font-mono text-xs text-dl-fg-muted transition-colors hover:border-dl-fg hover:text-dl-fg"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-dl-green" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            Copy link
          </>
        )}
      </button>
    </div>
  );
}
