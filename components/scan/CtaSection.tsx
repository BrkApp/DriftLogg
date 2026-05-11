"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Share2 } from "lucide-react";
import { EmailCapture } from "@/components/shared/EmailCapture";

export function CtaSection() {
  const [copied, setCopied] = useState(false);

  function share() {
    if (typeof window === "undefined") return;
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  }

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-dl-green/40 bg-dl-green/5 p-6 shadow-[0_0_60px_-20px_rgba(0,255,136,0.4)] sm:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-dl-green">
          {"// continuous monitoring"}
        </p>
        <h3 className="mt-3 text-lg font-bold text-dl-fg sm:text-xl md:text-2xl">
          Monitor this repo continuously — Team Plan $49/mo
        </h3>
        <p className="mt-2 text-sm text-dl-fg-muted">
          Get a Slack or email alert the moment the score drops. CI integration to block risky
          dependency bumps.
        </p>
        <Link
          href="/#pricing"
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-md bg-dl-green px-4 font-mono text-sm font-semibold text-black transition-colors hover:bg-dl-green/90"
        >
          See Team Plan <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="rounded-xl border border-dl-border bg-dl-surface p-6 sm:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-dl-fg-muted">
          {"// early access"}
        </p>
        <h3 className="mt-3 text-lg font-bold text-dl-fg">Get notified when it launches.</h3>
        <p className="mt-1 text-sm text-dl-fg-muted">
          Continuous monitoring, Slack alerts, CI integration — coming soon.
        </p>
        <div className="mt-5">
          <EmailCapture variant="inline" />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-dl-border font-mono text-sm text-dl-fg transition-colors hover:border-dl-fg-muted/40"
        >
          <ArrowLeft className="h-4 w-4" /> Scan another repo
        </Link>
        <button
          type="button"
          onClick={share}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-dl-border font-mono text-sm text-dl-fg transition-colors hover:border-dl-fg-muted/40"
        >
          <Share2 className="h-4 w-4" />
          {copied ? "Copied!" : "Share this report"}
        </button>
      </div>
    </section>
  );
}
