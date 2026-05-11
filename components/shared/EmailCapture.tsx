"use client";

import { useState, useTransition } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { joinWaitlist } from "@/app/actions/waitlist";

type Variant = "full" | "inline";

interface EmailCaptureProps {
  variant?: Variant;
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  className?: string;
}

export function EmailCapture({
  variant = "full",
  title = "Get early access to monitoring",
  subtitle = "No spam. One email when we launch Team plan.",
  buttonLabel = "Join waitlist",
  className = "",
}: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    startTransition(async () => {
      const result = await joinWaitlist(email);
      if (result.success) {
        setSubmitted(true);
        setEmail("");
      }
    });
  }

  const formNode = submitted ? (
    <div className="flex items-center justify-center gap-2 rounded-xl border border-dl-green/40 bg-dl-green/5 px-4 py-3 font-mono text-sm text-dl-green">
      <CheckCircle2 className="h-4 w-4 shrink-0" />
      You&apos;re on the list. We&apos;ll be in touch.
    </div>
  ) : (
    <form onSubmit={onSubmit}>
      <div className="flex flex-col gap-2 rounded-xl border border-dl-border bg-dl-surface p-2 transition-colors focus-within:border-dl-green/60 sm:flex-row sm:items-center">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          required
          className="w-full bg-transparent px-3 py-2.5 font-mono text-sm text-dl-fg placeholder:text-dl-fg-muted/60 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!email || isPending}
          className="group inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-dl-green px-5 text-sm font-bold text-black transition-all hover:bg-dl-green/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {buttonLabel}
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </form>
  );

  if (variant === "inline") {
    return <div className={className}>{formNode}</div>;
  }

  return (
    <div className={`text-center ${className}`}>
      <h2 className="text-3xl font-bold tracking-tight text-dl-fg sm:text-[32px]">{title}</h2>
      <div className="mx-auto mt-8 max-w-md">{formNode}</div>
      {subtitle && <p className="mt-4 text-xs text-dl-fg-muted">{subtitle}</p>}
    </div>
  );
}
